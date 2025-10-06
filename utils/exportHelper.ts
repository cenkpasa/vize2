
import { Person } from '../types';

export const exportPeopleToJson = (people: Person[]) => {
  if (people.length === 0) {
    alert('Dışa aktarılacak kişi bulunmuyor.');
    return;
  }

  const dataStr = JSON.stringify(people, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `schengen_randevu_yedek_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};