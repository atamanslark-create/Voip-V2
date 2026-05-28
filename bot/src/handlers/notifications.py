from aiogram import Router, types
import aiohttp
import json
from db import get_all_telephonists, get_all_managers

router = Router()

async def notify_telephonists_about_new_ticket(bot, ticket_data: dict):
    """Send notification to all telephonists about a new ticket"""
    telephonists = await get_all_telephonists()

    message = f"""
🆕 **New Error Ticket**

📞 SIP Line: **{ticket_data.get('sip_line_number', 'Unknown')}**
🏷️ Line Name: **{ticket_data.get('sip_line_name', 'Unknown')}**
⚠️ Error: **{ticket_data.get('error_name', 'Unknown')}**
📝 Title: {ticket_data.get('title', 'No title')}

Priority: {ticket_data.get('priority', 'medium').upper()}
Created: {ticket_data.get('created_at', 'N/A')}
    """

    for telephonist in telephonists:
        if telephonist['telegram_chat_id']:
            try:
                await bot.send_message(
                    chat_id=int(telephonist['telegram_chat_id']),
                    text=message
                )
            except Exception as e:
                print(f"Failed to notify telephonist {telephonist['id']}: {e}")

async def notify_managers_about_completion(bot, ticket_data: dict):
    """Send notification to all managers about completed ticket"""
    managers = await get_all_managers()

    message = f"""
✅ **Ticket Completed**

📞 SIP Line: **{ticket_data.get('sip_line_number', 'Unknown')}**
🏷️ Line Name: **{ticket_data.get('sip_line_name', 'Unknown')}**

Ticket ID: {ticket_data.get('ticket_id', 'N/A')}
Completed At: {ticket_data.get('completed_at', 'N/A')}
    """

    for manager in managers:
        if manager['telegram_chat_id']:
            try:
                await bot.send_message(
                    chat_id=int(manager['telegram_chat_id']),
                    text=message
                )
            except Exception as e:
                print(f"Failed to notify manager {manager['id']}: {e}")
