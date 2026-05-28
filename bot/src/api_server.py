from aiohttp import web
from aiogram import Bot
import os
from dotenv import load_dotenv
import json
import asyncio
from db import init_db, close_db
from handlers.notifications import notify_telephonists_about_new_ticket, notify_managers_about_completion

load_dotenv()

TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
bot = Bot(token=TOKEN)

async def handle_ticket_created(request):
    """Handle new ticket creation notification"""
    try:
        data = await request.json()

        ticket_data = {
            'ticket_id': data.get('ticket_id'),
            'sip_line_id': data.get('sip_line_id'),
            'sip_line_number': data.get('sip_number'),
            'sip_line_name': data.get('sip_line_name'),
            'error_name': data.get('error_name'),
            'title': data.get('title'),
            'description': data.get('description'),
            'priority': data.get('priority'),
            'created_at': data.get('created_at'),
        }

        await notify_telephonists_about_new_ticket(bot, ticket_data)
        return web.json_response({'status': 'ok'})
    except Exception as e:
        print(f"Error handling ticket created: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def handle_ticket_completed(request):
    """Handle ticket completion notification"""
    try:
        data = await request.json()

        ticket_data = {
            'ticket_id': data.get('ticket_id'),
            'sip_line_number': data.get('sip_number'),
            'sip_line_name': data.get('sip_line_name'),
            'completed_at': data.get('completed_at'),
        }

        await notify_managers_about_completion(bot, ticket_data)
        return web.json_response({'status': 'ok'})
    except Exception as e:
        print(f"Error handling ticket completed: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def init_app():
    app = web.Application()
    app.router.post('/notify/ticket-created', handle_ticket_created)
    app.router.post('/notify/ticket-completed', handle_ticket_completed)

    # Startup
    async def on_startup(app):
        await init_db()

    async def on_shutdown(app):
        await close_db()

    app.on_startup.append(on_startup)
    app.on_shutdown.append(on_shutdown)

    return app

async def run_api_server():
    app = await init_app()
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', int(os.getenv('BOT_API_PORT', 5001)))
    await site.start()
    print(f"✓ Bot API server running on port {os.getenv('BOT_API_PORT', 5001)}")
    return runner

if __name__ == '__main__':
    asyncio.run(run_api_server())
