import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED = ['journal-entries', 'vendors', 'payments', 'chart-of-accounts', 'audit-log', 'closing-checklist'];

export async function GET(
  _req: Request,
  { params }: { params: { entity: string } }
) {
  // Sanitise: strip any path separators to prevent directory traversal
  const safeEntity = path.basename(params.entity);

  if (!ALLOWED.includes(safeEntity)) {
    return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'mock-sap-data', `${safeEntity}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to parse data file' }, { status: 500 });
  }
}
