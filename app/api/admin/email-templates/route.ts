import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Allow both admin and supervisor
    const userRole = request.headers.get("x-user-role");
    if (!["admin", "supervisor"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: [{ category: "asc" }, { nameAr: "asc" }]
    });
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Allow both admin and supervisor
    const userRole = request.headers.get("x-user-role");
    if (!["admin", "supervisor"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    const body = await request.json();
    const { id, subject, bodyHtml, bodyText, isActive } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: { subject, bodyHtml, bodyText, isActive, updatedAt: new Date() }
    });
    return NextResponse.json({ success: true, template });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
