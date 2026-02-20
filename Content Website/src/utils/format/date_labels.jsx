// Converts timestamps to compact relative labels used by cards.
// Backend integration: pass ISO strings from posts.created_at after fetch.
export const relative_date_label = (iso) => {
  const date = new Date(iso || Date.now());
  const diff = Date.now() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(1, Math.floor(diff / dayMs));
  const lessThanDay = diff < dayMs;
  const lessThanWeek = days < 7;

  const values = {
    today: 'Σήμερα',
    day: `${days}η`,
    week: `${Math.floor(days / 7)}εβδ`
  };

  const key = lessThanDay ? 'today' : lessThanWeek ? 'day' : 'week';
  return values[key];
};

// Formats ISO strings for history entries shown to the client.
// Backend integration: provide server timestamps in ISO format for timezone-safe rendering.
export const format_history_datetime = (iso) => {
  const value = new Date(iso);
  const isValid = Number.isNaN(value.getTime()) === false;

  const output = {
    invalid: '-',
    valid: value.toLocaleString('el-GR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  return output[isValid ? 'valid' : 'invalid'];
};
