'use client';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeAgoProps {
  date: Date;
}

export default function TimeAgo({ date }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(date), { locale: es }));
  }, [date]);

  return <span>{`Hace ${timeAgo}`}</span>;
}
