import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mock Aadhaar verification function (in production, use actual API)
function verifyAadhaar(aadhaarNumber: string): { isValid: boolean; details?: any } {
  // Basic Aadhaar number validation (12 digits)
  const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
  
  if (!aadhaarRegex.test(aadhaarNumber)) {
    return { isValid: false };
  }

  // Mock verification - in production, use actual Aadhaar API
  // For demo, we'll accept specific test numbers
  const testAadhaarNumbers = [
    '234567890123',
    '345678901234',
    '456789012345',
    '567890123456',
  ];

  if (testAadhaarNumbers.includes(aadhaarNumber)) {
    return {
      isValid: true,
      details: {
        name: 'Test User',
        dob: '1990-01-01',
        gender: 'M',
        address: 'Test Address, India'
      }
    };
  }

  // For demo, randomly approve 70% of valid format numbers
  const isValid = Math.random() > 0.3;
  
  return {
    isValid,
    details: isValid ? {
      name: 'Verified User',
      dob: '1995-06-15',
      gender: 'M',
      address: 'Verified Address, India'
    } : undefined
  };
}

// Calculate age from date of birth
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const documentType = formData.get('documentType') as string;
    const documentNumber = formData.get('documentNumber') as string;
    const documentImage = formData.get('documentImage') as string; // Base64 image
    const selfieImage = formData.get('selfieImage') as string; // Base64 selfie

    if (!userId || !documentType || !documentNumber) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Verify based on document type
    let verificationResult: { isValid: boolean; details?: any } = { isValid: false };
    
    if (documentType === 'AADHAAR') {
      verificationResult = verifyAadhaar(documentNumber);
      
      if (verificationResult.isValid && verificationResult.details) {
        // Check age (must be 18+)
        const age = calculateAge(verificationResult.details.dob);
        if (age < 18) {
          return NextResponse.json({
            success: false,
            message: 'User must be 18 years or older',
            age
          }, { status: 400 });
        }
      }
    } else if (documentType === 'PAN') {
      // Basic PAN validation (ABCDE1234F format)
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      verificationResult.isValid = panRegex.test(documentNumber.toUpperCase());
    } else if (documentType === 'DRIVING_LICENSE') {
      // Basic DL validation
      const dlRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;
      verificationResult.isValid = dlRegex.test(documentNumber.toUpperCase());
    }

    if (!verificationResult.isValid) {
      return NextResponse.json({
        success: false,
        message: `Invalid ${documentType} number or verification failed`
      }, { status: 400 });
    }

    // Update user verification status (KYC document storage would be implemented with proper schema)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Note: These fields would need to be added to User model for full KYC implementation
        // For now, we'll just mark as verified if the field exists
        ...(user.emailVerified !== undefined && { emailVerified: new Date() })
      }
    });

    // Update user verification status (mark as verified)
    // Note: In production, you would add KYC-specific fields to the User model
    // For now, we'll use the existing emailVerified field as a placeholder
    if (documentType === 'AADHAAR') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: new Date() // Placeholder for KYC verification
        }
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'KYC Verification Successful',
        message: `Your ${documentType} has been verified successfully`,
        type: 'SYSTEM'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Document verified successfully',
      document: {
        id: updatedUser.id,
        type: documentType,
        status: 'VERIFIED',
        details: verificationResult.details
      }
    });

  } catch (error) {
    console.error('KYC upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// GET - Fetch user's KYC documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID required'
      }, { status: 400 });
    }

    // Note: KYC documents would be stored in a proper KYC table in production
    // For now, return mock data based on user verification status
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    const documents = user?.emailVerified ? [{
      id: user.id,
      documentType: 'AADHAAR',
      documentNumber: '****-****-1234',
      verificationStatus: 'VERIFIED',
      verifiedAt: user.emailVerified,
      createdAt: user.createdAt
    }] : [];

    return NextResponse.json({
      success: true,
      documents: documents.map((doc: any) => ({
        id: doc.id,
        type: doc.documentType,
        number: doc.documentNumber,
        status: doc.verificationStatus,
        verifiedAt: doc.verifiedAt,
        createdAt: doc.createdAt
      }))
    });

  } catch (error) {
    console.error('KYC fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
