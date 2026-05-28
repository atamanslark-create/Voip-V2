from aiogram import Router, types
from aiogram.filters import Command

router = Router()

@router.message(Command("admin"))
async def cmd_admin(message: types.Message):
    # This would be admin-specific commands
    # For now, just a placeholder
    await message.answer("🔐 Admin panel is accessible via the web app")
