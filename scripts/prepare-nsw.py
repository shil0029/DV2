"""Transcribe published Appendix 3 estimates; no simulated or digitised chart values.

Source: NSW DPIRD, Survey of recreational fishing in NSW 2023/24,
separate Appendices PDF, page 3. Units are numbers of individual organisms.
Each line is species | total | kept | released, in survey-year blocks.
The source rounds estimates independently, so kept + released can differ by 1.
2013/14 is excluded because its sampling frame differs from subsequent surveys.
"""
import json
from pathlib import Path

DATA = {
    "2017/18": """
Australian Bass|245690|11142|234548
Blue Swimmer Crab|84000|63034|20966
Bream|944288|228553|715735
Brown Trout|90086|37865|52221
Dusky Flathead|886749|310650|576099
Australian Salmon|60556|33948|26607
Golden Perch|194758|79297|115461
Leatherjacket|53063|31106|21956
Luderick|83544|51272|32272
Grey Morwong|33859|26770|7090
Mulloway|27173|13641|13533
Murray Cod|416677|36434|380242
Rainbow Trout|85200|28595|56606
Sand Flathead|648602|281844|366758
Sand Whiting|340783|120831|219953
Silver Trevally|49258|15315|33942
Snapper|451427|157534|293893
Tailor|227200|89914|137286
Yabbies|280681|180446|100234
Yellowtail Kingfish|107865|45791|62074
""",
    "2019/20": """
Australian Bass|84273|2161|82112
Blue Swimmer Crab|69116|42325|26791
Bream|1098534|234009|864525
Brown Trout|37132|14170|22962
Dusky Flathead|572822|182489|390333
Australian Salmon|61042|22292|38750
Golden Perch|97543|43560|53984
Leatherjacket|38111|18108|20003
Luderick|56540|39577|16963
Grey Morwong|15671|13264|2407
Mulloway|15619|6431|9188
Murray Cod|198045|7597|190448
Rainbow Trout|26970|6435|20535
Sand Flathead|370182|158386|211796
Sand Whiting|391146|165755|225391
Silver Trevally|67360|24476|42883
Snapper|475753|126989|348764
Tailor|191542|56416|135126
Yabbies|73501|63173|10328
Yellowtail Kingfish|82025|31184|50841
""",
    "2021/22": """
Australian Bass|57407|1686|55721
Blue Swimmer Crab|18180|13124|5057
Bream|1112741|223876|888865
Brown Trout|160864|12949|147915
Dusky Flathead|515197|148158|367040
Australian Salmon|87561|17336|70225
Golden Perch|110661|23728|86933
Leatherjacket|25228|8437|16791
Luderick|70960|57175|13785
Grey Morwong|14208|10360|3847
Mulloway|71277|12830|58447
Murray Cod|335478|17483|317995
Rainbow Trout|176437|28935|147502
Sand Flathead|205964|89530|116433
Sand Whiting|302238|127872|174366
Silver Trevally|55723|20605|35118
Snapper|306850|80339|226511
Tailor|214777|61261|153516
Yabbies|259616|163665|95951
Yellowtail Kingfish|48376|10062|38314
""",
    "2023/24": """
Australian Bass|128779|8480|120299
Blue Swimmer Crab|117936|92833|25103
Bream|1265260|303727|961533
Brown Trout|117051|26741|90310
Dusky Flathead|892908|331309|561599
Australian Salmon|103452|41455|61997
Golden Perch|109694|38759|70935
Leatherjacket|70730|50318|20413
Luderick|218770|141596|77173
Grey Morwong|11857|7478|4379
Mulloway|75168|18132|57036
Murray Cod|325457|45825|279632
Rainbow Trout|130493|23773|106720
Sand Flathead|270304|133610|136694
Sand Whiting|297480|114064|183417
Silver Trevally|70537|25465|45072
Snapper|517486|166486|351000
Tailor|320226|141137|179088
Yabbies|126011|104290|21721
Yellowtail Kingfish|131485|47705|83780
"""
}
root = Path(__file__).resolve().parents[1]
rows = []
for year, text in DATA.items():
    for line in text.strip().splitlines():
        species, total, kept, released = line.split('|')
        row = dict(species=species, year=year, total=int(total), kept=int(kept), released=int(released))
        # Published rounded categories can differ from total by a few organisms.
        row['release_share'] = row['released'] / row['total']
        rows.append(row)
assert len(rows) == 80
out = {
    'source': 'https://www.dpird.nsw.gov.au/__data/assets/pdf_file/0011/1646246/Appendices.pdf',
    'source_page': 3,
    'retrieved': '2026-10-26',
    'population': 'Members of households holding a long-term NSW recreational fishing licence who fished in NSW waters.',
    'unit': 'Estimated individual organisms caught, not tonnes or unique fishers.',
    'notes': [
        'Twenty monitored species or species groups, not all NSW catches.',
        'NSW data are a case study; they do not represent all Australian recreational fishing.',
        'Estimates have sampling uncertainty; changes in point estimates are not tests of statistical significance.',
        'Kept, released and total estimates are independently rounded. The source has differences of up to three organisms.',
        'Heatmap release shares use released / published total. Sankey widths use kept + released so the diagram conserves its displayed flows.',
        'Sand Flathead and Leatherjacket are source species groupings. Bream also groups multiple species.',
        'European Carp is absent from the 20-species time-comparison table and has not been added from another table.'
    ],
    'catch': rows,
    'waterbody_effort': [
        {'waterbody':'Estuaries','days':1033207}, {'waterbody':'Ocean','days':532678},
        {'waterbody':'Rivers','days':408190}, {'waterbody':'Lakes and dams','days':159602}
    ],
    'waterbody_note': 'Appendices page 2. Waterbody-specific fisher-days can overlap and should not be added to estimate unique statewide fisher-days.'
}
(root/'data/nsw.json').write_text(json.dumps(out, indent=2)+'\n')
print(f'Prepared {len(rows)} published species/year records.')
