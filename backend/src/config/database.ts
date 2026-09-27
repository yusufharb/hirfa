import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create ENUMs (ignoring if they exist)
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('customer', 'craftsman', 'admin');
        CREATE TYPE booking_status AS ENUM ('pending', 'searching', 'confirmed', 'craftsman_on_way', 'in_progress', 'completed', 'cancelled', 'disputed');
        CREATE TYPE scheduled_type AS ENUM ('now', 'scheduled');
        CREATE TYPE cancelled_by_type AS ENUM ('customer', 'craftsman', 'system');
        CREATE TYPE payment_method_type AS ENUM ('cash', 'fawry', 'vodafone_cash', 'credit_card', 'wallet');
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
        CREATE TYPE otp_purpose AS ENUM ('login', 'register', 'reset');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        profile_photo_url TEXT,
        role user_role DEFAULT 'customer',
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS craftsman_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        years_experience INT DEFAULT 0,
        service_area_km INT DEFAULT 10,
        is_available BOOLEAN DEFAULT true,
        rating DECIMAL(3,2) DEFAULT 5.0,
        total_reviews INT DEFAULT 0,
        total_jobs INT DEFAULT 0,
        national_id_number VARCHAR(20),
        national_id_verified BOOLEAN DEFAULT false,
        bank_account_number VARCHAR(30),
        bank_name VARCHAR(50),
        wallet_balance DECIMAL(12,2) DEFAULT 0,
        lat DECIMAL(10,8),
        lng DECIMAL(11,8),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS service_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name_ar VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        icon_url TEXT,
        base_price_min DECIMAL(10,2),
        base_price_max DECIMAL(10,2),
        description_ar TEXT,
        description_en TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS craftsman_skills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        craftsman_id UUID REFERENCES craftsman_profiles(id) ON DELETE CASCADE,
        service_category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
        years_in_skill INT DEFAULT 0,
        is_primary BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        label VARCHAR(50),
        address_line1 TEXT NOT NULL,
        address_line2 TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        lat DECIMAL(10,8),
        lng DECIMAL(11,8),
        is_default BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        craftsman_id UUID REFERENCES users(id) ON DELETE SET NULL,
        service_category_id UUID REFERENCES service_categories(id) ON DELETE RESTRICT,
        address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT,
        status booking_status DEFAULT 'pending',
        scheduled_type scheduled_type DEFAULT 'now',
        scheduled_at TIMESTAMPTZ,
        problem_description TEXT,
        customer_notes TEXT,
        estimated_price DECIMAL(10,2),
        final_price DECIMAL(10,2),
        platform_fee DECIMAL(10,2),
        craftsman_earnings DECIMAL(10,2),
        cancellation_reason TEXT,
        cancelled_by cancelled_by_type,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        platform_fee DECIMAL(10,2),
        payment_method payment_method_type NOT NULL,
        status payment_status DEFAULT 'pending',
        fawry_reference_number VARCHAR(100),
        fawry_merchant_ref VARCHAR(100),
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
        reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rating INT CHECK(rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(6) NOT NULL,
        purpose otp_purpose DEFAULT 'login',
        expires_at TIMESTAMPTZ NOT NULL,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT,
        body TEXT,
        type VARCHAR(50),
        data JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed Data
    const countRes = await client.query('SELECT COUNT(*) FROM service_categories');
    if (parseInt(countRes.rows[0].count) === 0) {
      const categories = [
        { en: 'Plumbing', ar: 'سباكة' },
        { en: 'Electrical', ar: 'كهرباء' },
        { en: 'Painting', ar: 'نقاشة' },
        { en: 'AC Services', ar: 'تكييف' },
        { en: 'Carpentry', ar: 'نجارة' },
        { en: 'Cleaning', ar: 'نظافة' },
        { en: 'General Maintenance', ar: 'صيانة عامة' },
        { en: 'Bathroom Renovation', ar: 'تجديد حمامات' },
        { en: 'Appliance Repair', ar: 'تصليح أجهزة' },
        { en: 'Moving', ar: 'نقل عفش' }
      ];
      
      for (const [index, cat] of categories.entries()) {
        await client.query(
          \`INSERT INTO service_categories (name_en, name_ar, sort_order) VALUES ($1, $2, $3)\`,
          [cat.en, cat.ar, index]
        );
      }
      console.log('Seeded 10 service categories.');
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};
