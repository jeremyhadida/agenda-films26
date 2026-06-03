import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Link,
} from '@react-pdf/renderer'
import type { Country, Film, FilmReleaseEvent } from '@/lib/types'
import {
  groupFilmsByMonth,
  getLatestEventByFilm,
  formatDateShort,
  formatGenerationDate,
  truncateCast,
  getRecentMovements,
} from './utils'

type FilmWithDate = Film & { release_date: string }

const BRAND = {
  dark: '#0f172a',
  darkLine: '#334155',
  textPrimary: '#f8fafc',
  textMuted: '#94a3b8',
  accent: '#6366f1',
}

const EVENT_COLORS = {
  added:        { dot: '#22c55e', badgeBg: '#166534', badgeText: '#dcfce7', label: 'AJOUT' },
  date_changed: { dot: '#ffd700', badgeBg: '#713f12', badgeText: '#fef08a', label: 'MODIFIÉ' },
  removed:      { dot: '#ef4444', badgeBg: '#7f1d1d', badgeText: '#fecaca', label: 'ANNULÉ' },
}

const s = StyleSheet.create({
  // Page de garde
  coverPage: {
    backgroundColor: BRAND.dark,
    fontFamily: 'Helvetica',
  },
  coverBand: {
    backgroundColor: BRAND.accent,
    paddingVertical: 8,
    paddingHorizontal: 40,
  },
  coverBandText: {
    color: '#ffffff',
    fontSize: 9,
    letterSpacing: 3,
    fontFamily: 'Helvetica-Bold',
  },
  coverBody: {
    padding: 40,
    flex: 1,
  },
  coverLabel: {
    color: BRAND.textMuted,
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 8,
  },
  coverCountry: {
    color: BRAND.textPrimary,
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  coverDate: {
    color: BRAND.textMuted,
    fontSize: 10,
    marginBottom: 36,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.darkLine,
    marginBottom: 24,
  },
  sectionTitle: {
    color: BRAND.textMuted,
    fontSize: 8,
    letterSpacing: 3,
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold',
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  movementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  movementInfo: {
    flex: 1,
  },
  movementTitle: {
    color: BRAND.textPrimary,
    fontSize: 10,
  },
  movementDates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    gap: 4,
  },
  movementDateOld: {
    color: BRAND.textMuted,
    fontSize: 8,
    textDecoration: 'line-through',
  },
  movementDateNew: {
    color: BRAND.textPrimary,
    fontSize: 8,
  },
  movementBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  movementBadgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  coverLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  coverLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coverLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  coverLegendText: {
    color: BRAND.textMuted,
    fontSize: 8,
  },
  onlineLink: {
    color: '#6366f1',
    fontSize: 9,
    marginTop: 32,
    textDecoration: 'underline',
  },

  // Page tableau
  tablePage: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: 40,
  },
  tablePageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tablePageLabel: {
    fontSize: 9,
    color: '#64748b',
    letterSpacing: 2,
  },
  tablePageCountry: {
    fontSize: 9,
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
  },

  // En-tête colonnes
  tableHead: {
    flexDirection: 'row',
    backgroundColor: BRAND.dark,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  headCell: {
    color: '#cbd5e1',
    fontSize: 7,
    letterSpacing: 1.5,
    fontFamily: 'Helvetica-Bold',
  },

  // Séparateur de mois
  monthSep: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderLeftWidth: 3,
    borderLeftColor: BRAND.accent,
    marginTop: 6,
  },
  monthSepText: {
    fontSize: 8.5,
    color: '#334155',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },

  // Lignes
  row: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  rowAdded:   { backgroundColor: '#dcfce7' },
  rowChanged: { backgroundColor: '#fefce8' },
  rowAlt: { backgroundColor: '#f8fafc' },

  cell: {
    fontSize: 8,
    color: '#1e293b',
    paddingRight: 6,
  },
  cellMuted: {
    fontSize: 8,
    color: '#475569',
    paddingRight: 6,
  },

  // Largeurs colonnes (portrait A4, ~535pt utiles)
  cDate: { width: 58 },
  cTitle: { flex: 3 },
  cStudio: { flex: 1.5 },
  cGenre: { flex: 1 },
  cDirector: { flex: 1.5 },
  cCast: { flex: 2 },

  // Légende
  legend: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 7,
    color: '#64748b',
  },

  // Pagination
  pageNum: {
    position: 'absolute',
    bottom: 18,
    right: 30,
    fontSize: 7,
    color: '#94a3b8',
  },
})

function CoverPage({
  country,
  generatedAt,
  events,
}: {
  country: Country
  generatedAt: Date
  events: FilmReleaseEvent[]
}) {
  const movements = getRecentMovements(events)
  return (
    <Page size="A4" style={s.coverPage}>
      <View style={s.coverBand}>
        <Text style={s.coverBandText}>FILMS 26 — AGENDA</Text>
      </View>

      <View style={s.coverBody}>
        <Text style={s.coverLabel}>CALENDRIER EXPLOITANT</Text>
        <Text style={s.coverCountry}>{country.name.toUpperCase()}</Text>
        <Text style={s.coverDate}>Généré le {formatGenerationDate(generatedAt)}</Text>

        <View style={s.divider} />

        {movements.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>DERNIERS MOUVEMENTS</Text>
            {movements.map((ev, i) => {
              const colors = EVENT_COLORS[ev.event_type as keyof typeof EVENT_COLORS] ?? EVENT_COLORS.added
              const isRemoved = ev.event_type === 'removed'
              const isAdded = ev.event_type === 'added'
              return (
                <View key={i} style={s.movementRow}>
                  <View style={[s.movementDot, { backgroundColor: colors.dot }]} />
                  <View style={s.movementInfo}>
                    <Text style={s.movementTitle}>
                      {(ev.film?.title_vf ?? ev.film?.title ?? ev.film_id).toUpperCase()}
                    </Text>
                    <View style={s.movementDates}>
                      {isAdded && ev.new_date && (
                        <Text style={s.movementDateNew}>{formatDateShort(ev.new_date)}</Text>
                      )}
                      {!isAdded && ev.old_date && (
                        <Text style={s.movementDateOld}>{formatDateShort(ev.old_date)}</Text>
                      )}
                      {!isAdded && !isRemoved && ev.new_date && (
                        <>
                          <Text style={s.movementDateNew}>→</Text>
                          <Text style={s.movementDateNew}>{formatDateShort(ev.new_date)}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={[s.movementBadge, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[s.movementBadgeText, { color: colors.badgeText }]}>
                      {colors.label}
                    </Text>
                  </View>
                </View>
              )
            })}

            <View style={s.coverLegend}>
              {Object.values(EVENT_COLORS).map(c => (
                <View key={c.label} style={s.coverLegendItem}>
                  <View style={[s.coverLegendDot, { backgroundColor: c.dot }]} />
                  <Text style={s.coverLegendText}>{c.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Link src={`https://agenda-f26.vercel.app/${country.id}`} style={s.onlineLink}>
          Voir en ligne → agenda-f26.vercel.app/{country.id}
        </Link>
      </View>
    </Page>
  )
}

function AgendaTablePage({
  country,
  films,
  eventMap,
}: {
  country: Country
  films: FilmWithDate[]
  eventMap: Map<string, 'added' | 'date_changed'>
}) {
  const monthGroups = groupFilmsByMonth(films)

  return (
    <Page size="A4" style={s.tablePage}>
      {/* En-tête répété sur chaque page */}
      <View style={s.tablePageHeader} fixed>
        <Text style={s.tablePageLabel}>CALENDRIER EXPLOITANT</Text>
        <Text style={s.tablePageCountry}>{country.name}</Text>
      </View>

      {/* En-tête du tableau répété sur chaque page */}
      <View style={s.tableHead} fixed>
        <Text style={[s.headCell, s.cDate]}>DATE</Text>
        <Text style={[s.headCell, s.cTitle]}>TITRE</Text>
        <Text style={[s.headCell, s.cStudio]}>STUDIO</Text>
        <Text style={[s.headCell, s.cGenre]}>GENRE</Text>
        <Text style={[s.headCell, s.cDirector]}>RÉALISATEUR</Text>
        <Text style={[s.headCell, s.cCast]}>CASTING</Text>
      </View>

      {/* Groupes par mois */}
      {monthGroups.map((group) => (
        <View key={group.month}>
          <View style={s.monthSep}>
            <Text style={s.monthSepText}>{group.month}</Text>
          </View>

          {group.films.map((film, idx) => {
            const highlight = eventMap.get(film.id)
            const rowVariant =
              highlight === 'added'
                ? s.rowAdded
                : highlight === 'date_changed'
                  ? s.rowChanged
                  : idx % 2 !== 0
                    ? s.rowAlt
                    : {}
            const genre = film.genre
              ? film.genre.split(',')[0].trim()
              : '—'

            return (
              <View key={film.id} style={[s.row, rowVariant]}>
                <Text style={[s.cell, s.cDate]}>
                  {formatDateShort(film.release_date)}
                </Text>
                <Text style={[s.cell, s.cTitle, { fontFamily: 'Helvetica-Bold' }]}>
                  {(film.title_vf ?? film.title).toUpperCase()}
                </Text>
                <Text style={[s.cellMuted, s.cStudio]}>
                  {film.studio ?? '—'}
                </Text>
                <Text style={[s.cellMuted, s.cGenre]}>{genre}</Text>
                <Text style={[s.cellMuted, s.cDirector]}>
                  {film.director ?? '—'}
                </Text>
                <Text style={[s.cellMuted, s.cCast]}>
                  {truncateCast(film.cast_main)}
                </Text>
              </View>
            )
          })}
        </View>
      ))}

      {/* Légende */}
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View
            style={[
              s.legendDot,
              { backgroundColor: '#dcfce7', borderWidth: 0.5, borderColor: '#16a34a' },
            ]}
          />
          <Text style={s.legendText}>Ajout récent</Text>
        </View>
        <View style={s.legendItem}>
          <View
            style={[
              s.legendDot,
              { backgroundColor: '#fefce8', borderWidth: 0.5, borderColor: '#ca8a04' },
            ]}
          />
          <Text style={s.legendText}>Modification de date</Text>
        </View>
      </View>

      {/* Numéro de page */}
      <Text
        style={s.pageNum}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
        fixed
      />
    </Page>
  )
}

export function AgendaPdfDocument({
  country,
  films,
  events,
  generatedAt,
}: {
  country: Country
  films: FilmWithDate[]
  events: FilmReleaseEvent[]
  generatedAt: Date
}) {
  const eventMap = getLatestEventByFilm(events)
  const sortedFilms = [...films].sort((a, b) =>
    a.release_date.localeCompare(b.release_date)
  )

  return (
    <Document
      title={`Agenda ${country.name} — Films 26`}
      author="Films 26"
      subject={`Calendrier exploitant ${country.name}`}
    >
      <CoverPage
        country={country}
        generatedAt={generatedAt}
        events={events}
      />
      <AgendaTablePage
        country={country}
        films={sortedFilms}
        eventMap={eventMap}
      />
    </Document>
  )
}
