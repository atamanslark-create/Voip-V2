from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
import aiohttp
import os
from dotenv import load_dotenv

load_dotenv()

router = Router()
API_URL = os.getenv('API_URL', 'http://localhost:5000/api')

@router.message(CommandStart())
async def cmd_start(message: types.Message, state: FSMContext):
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(text="🎫 My Tickets", callback_data="tickets")],
        [types.InlineKeyboardButton(text="📊 Statistics", callback_data="stats")],
        [types.InlineKeyboardButton(text="ℹ️ Help", callback_data="help")],
    ])

    await message.answer(
        "👋 Welcome to VoIP Management Bot!\n\n"
        "I can help you manage phone line errors and tickets.\n"
        "Choose an option below:",
        reply_markup=keyboard
    )

@router.callback_query(lambda c: c.data == "help")
async def show_help(callback: types.CallbackQuery):
    help_text = """
📖 **Help**

**Available Commands:**
• /start - Start the bot
• /tickets - View my tickets
• /help - Show this help

**How to use:**
1. Connect your Telegram account in the web app
2. Receive notifications about new errors
3. Update ticket status directly from Telegram
4. View statistics

**Roles:**
👨‍💼 **Manager** - Create and monitor tickets
🧑‍💼 **Telephonist** - Handle and resolve tickets
👨‍🔧 **Admin** - Full system access

For more info, visit the web application.
    """
    await callback.message.edit_text(help_text)
    await callback.answer()
