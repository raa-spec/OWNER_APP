import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findOwner, stageOwnerRegistration } from '@/lib/db';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, mobile, email, password, confirmPassword } = body;

    // Validate presence
    if (!fullName || !mobile || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Please fill all required registration fields.' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match. Please verify both password fields.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Stage registration & generate 6-digit Gmail OTP
    const generatedOtp = await stageOwnerRegistration({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    // Send real verification email via Nodemailer
    const emailResult = await sendOtpEmail({
      toEmail: email.trim(),
      otp: generatedOtp,
      fullName: fullName.trim(),
      type: 'register',
    });

    return NextResponse.json(
      {
        success: true,
        message: emailResult.success
          ? `✓ 6-digit verification code sent directly to your Gmail (${email.trim()})!`
          : `Verification code generated for ${email.trim()}`,
        emailSent: emailResult.success,
        expiresIn: 600,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send Register OTP Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error generating verification code.' },
      { status: 500 }
    );
  }
}
