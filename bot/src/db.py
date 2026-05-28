import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
pool = None

async def init_db():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL)
    return pool

async def close_db():
    global pool
    if pool:
        await pool.close()

async def get_user_by_telegram_id(telegram_id: int):
    async with pool.acquire() as conn:
        return await conn.fetchrow(
            'SELECT id, email, full_name, role FROM users WHERE telegram_chat_id = $1',
            str(telegram_id)
        )

async def set_user_telegram_id(user_id: str, telegram_id: int):
    async with pool.acquire() as conn:
        await conn.execute(
            'UPDATE users SET telegram_chat_id = $1 WHERE id = $2',
            str(telegram_id), user_id
        )

async def get_telephonist_tickets(user_id: str):
    async with pool.acquire() as conn:
        return await conn.fetch(
            '''SELECT t.*, sl.name as sip_line_name, sl.number as sip_number, et.name as error_name
               FROM tickets t
               LEFT JOIN sip_lines sl ON t.sip_line_id = sl.id
               LEFT JOIN error_templates et ON t.error_template_id = et.id
               WHERE t.assigned_to_id = $1 AND t.status != 'closed'
               ORDER BY t.created_at DESC LIMIT 10''',
            user_id
        )

async def get_all_telephonists():
    async with pool.acquire() as conn:
        return await conn.fetch(
            'SELECT id, telegram_chat_id FROM users WHERE role = $1 AND telegram_chat_id IS NOT NULL',
            'telephonist'
        )

async def get_all_managers():
    async with pool.acquire() as conn:
        return await conn.fetch(
            'SELECT id, telegram_chat_id FROM users WHERE role = $1 AND telegram_chat_id IS NOT NULL',
            'manager'
        )
