import { NextResponse } from 'next/server';

const MOYSKLAD_API_URL = process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2';
const MOYSKLAD_TOKEN = process.env.MOYSKLAD_TOKEN;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, vin } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    if (!MOYSKLAD_TOKEN) {
      console.error('MOYSKLAD_TOKEN is not defined');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const description = `ЗАПРОС КОНСУЛЬТАЦИИ С САЙТА

Имя и Фамилия: ${name || 'Не указано'}
Телефон: ${phone}
VIN / Кузов: ${vin || 'Не указан'}

Пожалуйста, свяжитесь с клиентом для подбора запчасти.`;

    // 1. Get current employee to assign the task to
    const employeeResponse = await fetch(`${MOYSKLAD_API_URL}/context/employee`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MOYSKLAD_TOKEN}`,
        'Accept-Encoding': 'gzip'
      }
    });

    if (!employeeResponse.ok) {
      console.error('Failed to get employee context', await employeeResponse.text());
      return NextResponse.json({ error: 'Failed to get employee context' }, { status: 500 });
    }

    const employeeData = await employeeResponse.json();

    // The context endpoint sometimes returns an href with query params like ?expand=cashier
    // We must strip this query parameter when passing it back as an assignee meta link
    const cleanMeta = {
      ...employeeData.meta,
      href: employeeData.meta.href.split('?')[0]
    };

    // 2. Create the task
    const response = await fetch(`${MOYSKLAD_API_URL}/entity/task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MOYSKLAD_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      body: JSON.stringify({
        description: description,
        assignee: {
          meta: cleanMeta
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Moysklad API Error creating task:', response.status, errorData);
      return NextResponse.json({ error: 'Failed to create task in Moysklad' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, taskId: data.id });
  } catch (error) {
    console.error('Error in consultation API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
