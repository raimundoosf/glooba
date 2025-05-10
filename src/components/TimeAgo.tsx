/**
 * Component for displaying human-readable relative time.
 * @module TimeAgo
 */
'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';

/**
 * Props interface for the TimeAgo component
 * @interface TimeAgoProps
 */
interface TimeAgoProps {
  date: Date;
}

/**
 * Component that displays relative time in Spanish (e.g., "Hace 2 horas")
 * @param {TimeAgoProps} props - Component props
 * @returns {JSX.Element} The time ago component
 */
export default function TimeAgo({ date }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  /**
   * Updates the time ago text when the date changes
   */
  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(date), { locale: es }));
  }, [date]);

  return <span>{`Hace ${timeAgo}`}</span>;
}
