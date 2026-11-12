import { TasmikSchoolRecord, YearClassData } from '../types';

/**
 * Menghasilkan data breakdown kelas Tahun 1 hingga Tahun 6 bagi sesebuah sekolah
 * sekiranya belum ada data terperinci disimpan.
 */
export function generateDefaultClassBreakdown(school: TasmikSchoolRecord): YearClassData[] {
  if (school.classBreakdown && school.classBreakdown.length > 0) {
    return school.classBreakdown;
  }

  const total = Math.max(school.totalStudents, 30);
  const avgPerClass = Math.floor(total / 6);
  const remainder = total % 6;

  // Anggaran taburan murid mengikut kohort persekolahan:
  // Tahun 1: Kebanyakan Iqra 1, 2, 3, sebahagian Iqra 4
  // Tahun 2: Iqra 3, 4, 5, 6, sedikit Juz 1-5
  // Tahun 3: Iqra 5, 6, Juz 1-5, Juz 6-10
  // Tahun 4: Juz 1-5, Juz 6-10, Juz 11-15, Juz 16-20
  // Tahun 5: Juz 11-15, Juz 16-20, Juz 21-25, Juz 26-30
  // Tahun 6: Juz 21-25, Juz 26-30, Khatam Al-Quran

  const c1Total = avgPerClass + (remainder > 0 ? 1 : 0);
  const c2Total = avgPerClass + (remainder > 1 ? 1 : 0);
  const c3Total = avgPerClass + (remainder > 2 ? 1 : 0);
  const c4Total = avgPerClass + (remainder > 3 ? 1 : 0);
  const c5Total = avgPerClass + (remainder > 4 ? 1 : 0);
  const c6Total = avgPerClass;

  // Mengagihkan mengikut jumlah sebenar sekolah
  const i1 = school.iqra1 || 0;
  const i2 = school.iqra2 || 0;
  const i3 = school.iqra3 || 0;
  const i4 = school.iqra4 || 0;
  const i5_6 = school.iqra5_6 || 0;
  const i5 = Math.ceil(i5_6 / 2);
  const i6 = Math.floor(i5_6 / 2);

  const j1_5 = school.juz1_5 || 0;
  const j6_10 = school.juz6_10 || 0;
  const j11_15 = school.juz11_15 || 0;
  const j16_20 = school.juz16_20 || 0;
  const j21_25 = school.juz21_25 || 0;
  const j26_30 = school.juz26_30 || 0;
  const khatam = school.khatam || 0;

  return [
    {
      kelas: 'TAHUN 1',
      bilMurid: c1Total,
      i1: Math.round(i1 * 0.7),
      i2: Math.round(i2 * 0.5),
      i3: Math.round(i3 * 0.3),
      i4: Math.round(i4 * 0.1),
      i5: 0,
      i6: 0,
      juz1_5: 0,
      juz6_10: 0,
      juz11_15: 0,
      juz16_20: 0,
      juz21_25: 0,
      juz26_30: 0,
      khatam: 0
    },
    {
      kelas: 'TAHUN 2',
      bilMurid: c2Total,
      i1: Math.round(i1 * 0.25),
      i2: Math.round(i2 * 0.35),
      i3: Math.round(i3 * 0.4),
      i4: Math.round(i4 * 0.35),
      i5: Math.round(i5 * 0.2),
      i6: 0,
      juz1_5: Math.round(j1_5 * 0.1),
      juz6_10: 0,
      juz11_15: 0,
      juz16_20: 0,
      juz21_25: 0,
      juz26_30: 0,
      khatam: 0
    },
    {
      kelas: 'TAHUN 3',
      bilMurid: c3Total,
      i1: Math.max(0, i1 - Math.round(i1 * 0.95)),
      i2: Math.round(i2 * 0.15),
      i3: Math.round(i3 * 0.2),
      i4: Math.round(i4 * 0.35),
      i5: Math.round(i5 * 0.45),
      i6: Math.round(i6 * 0.3),
      juz1_5: Math.round(j1_5 * 0.35),
      juz6_10: Math.round(j6_10 * 0.15),
      juz11_15: 0,
      juz16_20: 0,
      juz21_25: 0,
      juz26_30: 0,
      khatam: 0
    },
    {
      kelas: 'TAHUN 4',
      bilMurid: c4Total,
      i1: 0,
      i2: 0,
      i3: Math.max(0, i3 - Math.round(i3 * 0.9)),
      i4: Math.round(i4 * 0.15),
      i5: Math.round(i5 * 0.25),
      i6: Math.round(i6 * 0.4),
      juz1_5: Math.round(j1_5 * 0.35),
      juz6_10: Math.round(j6_10 * 0.45),
      juz11_15: Math.round(j11_15 * 0.3),
      juz16_20: Math.round(j16_20 * 0.15),
      juz21_25: 0,
      juz26_30: 0,
      khatam: 0
    },
    {
      kelas: 'TAHUN 5',
      bilMurid: c5Total,
      i1: 0,
      i2: 0,
      i3: 0,
      i4: Math.max(0, i4 - Math.round(i4 * 0.95)),
      i5: Math.round(i5 * 0.1),
      i6: Math.round(i6 * 0.2),
      juz1_5: Math.round(j1_5 * 0.15),
      juz6_10: Math.round(j6_10 * 0.3),
      juz11_15: Math.round(j11_15 * 0.45),
      juz16_20: Math.round(j16_20 * 0.5),
      juz21_25: Math.round(j21_25 * 0.3),
      juz26_30: Math.round(j26_30 * 0.15),
      khatam: Math.round(khatam * 0.15)
    },
    {
      kelas: 'TAHUN 6',
      bilMurid: c6Total,
      i1: 0,
      i2: 0,
      i3: 0,
      i4: 0,
      i5: 0,
      i6: Math.max(0, i6 - Math.round(i6 * 0.9)),
      juz1_5: Math.max(0, j1_5 - Math.round(j1_5 * 0.95)),
      juz6_10: Math.round(j6_10 * 0.1),
      juz11_15: Math.round(j11_15 * 0.25),
      juz16_20: Math.round(j16_20 * 0.35),
      juz21_25: Math.round(j21_25 * 0.7),
      juz26_30: Math.round(j26_30 * 0.85),
      khatam: Math.max(khatam - Math.round(khatam * 0.15), 0)
    }
  ];
}

/**
 * Mengira jumlah baris bagi setiap lajur (Total column sum)
 */
export function calculateTapakTotals(rows: YearClassData[]): YearClassData {
  return rows.reduce(
    (acc, row) => ({
      kelas: 'JUMLAH KESELURUHAN',
      bilMurid: acc.bilMurid + (Number(row.bilMurid) || 0),
      i1: acc.i1 + (Number(row.i1) || 0),
      i2: acc.i2 + (Number(row.i2) || 0),
      i3: acc.i3 + (Number(row.i3) || 0),
      i4: acc.i4 + (Number(row.i4) || 0),
      i5: acc.i5 + (Number(row.i5) || 0),
      i6: acc.i6 + (Number(row.i6) || 0),
      juz1_5: acc.juz1_5 + (Number(row.juz1_5) || 0),
      juz6_10: acc.juz6_10 + (Number(row.juz6_10) || 0),
      juz11_15: acc.juz11_15 + (Number(row.juz11_15) || 0),
      juz16_20: acc.juz16_20 + (Number(row.juz16_20) || 0),
      juz21_25: acc.juz21_25 + (Number(row.juz21_25) || 0),
      juz26_30: acc.juz26_30 + (Number(row.juz26_30) || 0),
      khatam: acc.khatam + (Number(row.khatam) || 0)
    }),
    {
      kelas: 'JUMLAH KESELURUHAN',
      bilMurid: 0,
      i1: 0,
      i2: 0,
      i3: 0,
      i4: 0,
      i5: 0,
      i6: 0,
      juz1_5: 0,
      juz6_10: 0,
      juz11_15: 0,
      juz16_20: 0,
      juz21_25: 0,
      juz26_30: 0,
      khatam: 0
    }
  );
}
