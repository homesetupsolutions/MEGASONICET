'use client';
import { useState, useEffect } from 'react';

export default function TitleBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      height: '42px',
      minHeight: '42px',
      background: '#0d0d18',
      borderBottom: '1px solid #1e1e2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <span style={{ color: '#00f5ff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.12em' }}>
        MEGASONIC
      </span>
      <span style={{ color: '#64748b', fontSize: '11px' }}>
        {date} &mdash; {time}
      </span>
      <span style={{ color: '#444', fontSize: '11px' }}>Vancouver, BC</span>
    </div>
  );
}
