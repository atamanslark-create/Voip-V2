from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
import aiohttp
import os
from dotenv import load_dotenv
from db import get_user_by_telegram_id, get_telephonist_tickets

load_dotenv()

router = Router()
API_URL = os.getenv('API_URL', 'http://localhost:5000/api')

@router.message(Command("tickets"))
async def cmd_tickets(message: types.Message):
    user = await get_user_by_telegram_id(message.from_user.id)

    if not user:
        await message.answer("❌ Please connect your account in the web app first")
        return

    try:
        tickets = await get_telephonist_tickets(user['id'])

        if not tickets:
            await message.answer("📭 No active tickets assigned to you")
            return

        response = "🎫 **Your Tickets:**\n\n"

        for i, ticket in enumerate(tickets, 1):
            status_emoji = {
                'new': '🆕',
                'in_progress': '⏳',
                'completed': '✅',
            }.get(ticket['status'], '❓')

            response += f"{status_emoji} **#{i}** {ticket['sip_number']} - {ticket['sip_line_name']}\n"
            response += f"   Error: {ticket['error_name']}\n"
            response += f"   Status: {ticket['status'].replace('_', ' ')}\n\n"

        keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
            [types.InlineKeyboardButton(text="🔄 Refresh", callback_data="refresh_tickets")],
        ])

        await message.answer(response, reply_markup=keyboard)

    except Exception as e:
        await message.answer(f"❌ Error fetching tickets: {str(e)}")

@router.callback_query(lambda c: c.data == "refresh_tickets")
async def refresh_tickets(callback: types.CallbackQuery):
    user = await get_user_by_telegram_id(callback.from_user.id)

    if user:
        tickets = await get_telephonist_tickets(user['id'])

        response = "🎫 **Your Tickets (Updated):**\n\n"

        for i, ticket in enumerate(tickets, 1):
            status_emoji = {
                'new': '🆕',
                'in_progress': '⏳',
                'completed': '✅',
            }.get(ticket['status'], '❓')

            response += f"{status_emoji} **#{i}** {ticket['sip_number']}\n"
            response += f"   Line: {ticket['sip_line_name']}\n"
            response += f"   Error: {ticket['error_name']}\n"
            response += f"   Status: {ticket['status'].replace('_', ' ')}\n\n"

        keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
            [types.InlineKeyboardButton(text="🔄 Refresh", callback_data="refresh_tickets")],
        ])

        await callback.message.edit_text(response, reply_markup=keyboard)

    await callback.answer()
