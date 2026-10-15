import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createPasswordResetOtp, verifyAndResetPassword } from '@/lib/db';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, identifier, otp, newPassword } = body;

    if (action === 'send_otp') {
      if (!identifier) {
        return NextResponse.json(
          { success: false, error: 'Please enter your registered email or phone.' },
          { status: 400 }
        );
      }
      const generatedOtp = await createPasswordResetOtp(identifier);
      
      // If identifier looks like an email, send real email
      if (identifier.includes('@')) {
        await sendOtpEmail({
          toEmail: identifier.trim(),
          otp: generatedOtp,
          type: 'reset',
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: `Password reset OTP sent to ${identifier}`,
          demoOtp: generatedOtp,
        },
        { status: 200 }
      );
    } else if (action === 'reset_password') {
      if (!identifier || !otp || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Please provide identifier, OTP, and new password.' },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      const result = await verifyAndResetPassword(identifier, otp, newHash);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Invalid OTP code.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Password reset successfully! You can now login.' },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during password reset.' },
      { status: 500 }
    );
  }
}
