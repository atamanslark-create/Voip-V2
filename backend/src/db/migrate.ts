import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
