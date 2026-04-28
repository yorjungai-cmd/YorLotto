export function getRichCountdownText(): string {
  const today = new Date();
  
  // Set time to 00:00:00 for accurate day difference
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const targetDate = new Date(current);
  const date = current.getDate();
  
  if (date === 1 || date === 16) {
    return "วันนี้รวย";
  } else if (date < 16) {
    targetDate.setDate(16);
  } else {
    // Next month's 1st
    targetDate.setMonth(current.getMonth() + 1, 1);
  }
  
  const diffTime = targetDate.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return "พรุ่งนี้รวย";
  } else {
    return `อีก ${diffDays} วันรวย`;
  }
}
