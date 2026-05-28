import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const client = new pg.Client(process.env.DATABASE_URL);

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to database');

    const schemaPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    await client.query(schema);
    console.log('✓ Database schema created successfully');

    // Insert default error templates
    const templates = [
      { name: 'No Dial Tone', description: 'Нет гудка', icon: '📞' },
      { name: 'One Way Audio', description: 'Односторонний звук', icon: '🔊' },
      { name: 'Echo', description: 'Эхо на линии', icon: '🔄' },
      { name: 'Call Dropping', description: 'Обрывы звонков', icon: '❌' },
      { name: 'Poor Quality', description: 'Плохое качество', icon: '📉' },
      { name: 'Cannot Dial Out', description: 'Не могу позвонить', icon: '🚫' },
      { name: 'Cannot Receive Calls', description: 'Не получаю звонки', icon: '📵' },
      { name: 'Line Registration Error', description: 'Ошибка регистрации', icon: '⚠️' },
    ];

    for (const template of templates) {
      await client.query(
        'INSERT INTO error_templates (name, description, icon) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [template.name, template.description, template.icon]
      );
    }
    console.log('✓ Default error templates inserted');

    // Create demo users with bcrypt hashed password
    const password_hash = await bcrypt.hash('password', 10);

    const users = [
      { email: 'admin@example.com', full_name: 'Administrator', role: 'admin' },
      { email: 'manager@example.com', full_name: 'Demo Manager', role: 'manager' },
      { email: 'telephonist@example.com', full_name: 'Demo Telephonist', role: 'telephonist' },
    ];

    for (const user of users) {
      await client.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [user.email, password_hash, user.full_name, user.role]
      );
    }
    console.log('✓ Demo users created');

    // Create demo SIP lines
    const lines = [
      { name: 'Line 1', number: '101', color: '#ef4444', description: 'Main reception line' },
      { name: 'Line 2', number: '102', color: '#f97316', description: 'Support line' },
      { name: 'Line 3', number: '103', color: '#eab308', description: 'Sales line' },
      { name: 'Line 4', number: '104', color: '#22c55e', description: 'Manager line' },
    ];

    for (const line of lines) {
      await client.query(
        'INSERT INTO sip_lines (name, number, color, description) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [line.name, line.number, line.color, line.description]
      );
    }
    console.log('✓ Demo SIP lines created');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
