/* ===== Dictionary: English | Nederlands | Français ===== */
(() => {
const rows = `
Offers|Offertes|Offres
Price book|Prijsboek|Tarifs
Settings|Instellingen|Paramètres
Shared · saved online|Gedeeld · online bewaard|Partagé · enregistré en ligne
This browser only|Alleen in deze browser|Uniquement dans ce navigateur
Saved on this device|Bewaard op dit toestel|Enregistré sur cet appareil
Offers and prices are stored with this page and shared with your team.|Offertes en prijzen worden bij deze pagina bewaard en gedeeld met je team.|Les offres et les prix sont enregistrés avec cette page et partagés avec votre équipe.
Offers are kept in this browser. Open the page from claude.ai to share them with your team.|Offertes blijven in deze browser. Open de pagina via claude.ai om ze met je team te delen.|Les offres restent dans ce navigateur. Ouvrez la page via claude.ai pour les partager avec votre équipe.
by Winsol|door Winsol|par Winsol
Main|Hoofdmenu|Menu principal
Language|Taal|Langue
Configure · Price · Quote|Configureren · Prijzen · Offreren|Configurer · Chiffrer · Offrir
+ New offer|+ Nieuwe offerte|+ Nouvelle offre
New offer|Nieuwe offerte|Nouvelle offre
Prices come from the sample price book. Upload your price grids under|De prijzen komen uit het voorbeeldprijsboek. Laad je prijsrasters op onder|Les prix proviennent du tarif d'exemple. Chargez vos grilles de prix sous
to quote exact prices.|om exacte prijzen te offreren.|pour chiffrer des prix exacts.
Search client, offer number or reference|Zoek klant, offertenummer of referentie|Rechercher client, numéro d'offre ou référence
Search offers|Offertes zoeken|Rechercher des offres
No offers yet|Nog geen offertes|Pas encore d'offres
Start with the client’s name, then add windows and doors.|Begin met de naam van de klant en voeg dan ramen en deuren toe.|Commencez par le nom du client, puis ajoutez fenêtres et portes.
No client name|Geen klantnaam|Pas de nom de client
Draft|Concept|Brouillon
Sent|Verstuurd|Envoyée
Accepted|Aanvaard|Acceptée
Lost|Verloren|Perdue
← Offers|← Offertes|← Offres
Offer steps|Offertestappen|Étapes de l'offre
Client|Klant|Client
Products|Producten|Produits
Offer|Offerte|Offre
Who is the offer for? Only the name is required.|Voor wie is de offerte? Enkel de naam is verplicht.|Pour qui est l'offre ? Seul le nom est obligatoire.
Client name *|Naam klant *|Nom du client *
e.g. Jan Peeters|bv. Jan Peeters|p. ex. Jan Peeters
Company|Bedrijf|Société
VAT number|Btw-nummer|Numéro de TVA
Email|E-mail|E-mail
Phone|Telefoon|Téléphone
Street and number|Straat en nummer|Rue et numéro
Postcode|Postcode|Code postal
City|Gemeente|Commune
Project|Project|Projet
Reference|Referentie|Référence
e.g. Renovation ground floor|bv. Renovatie gelijkvloers|p. ex. Rénovation rez-de-chaussée
Site address (if different)|Werfadres (indien anders)|Adresse du chantier (si différente)
VAT rate|Btw-tarief|Taux de TVA
21 % · standard|21 % · standaard|21 % · standard
6 % · renovation, home older than 10 years|6 % · renovatie, woning ouder dan 10 jaar|6 % · rénovation, habitation de plus de 10 ans
0 % · intra-EU / co-contractor|0 % · intracommunautair / medecontractant|0 % · intracommunautaire / cocontractant
Offer date|Offertedatum|Date de l'offre
Valid for (days)|Geldig (dagen)|Valable (jours)
Continue to products →|Verder naar producten →|Continuer vers les produits →
How it works|Zo werkt het|Fonctionnement
— name and project details.|— naam en projectgegevens.|— nom et données du projet.
— configure each window or door: material, system, type, size, colours, glass, hardware and options. The price updates as you go.|— configureer elk raam of elke deur: materiaal, systeem, type, maat, kleuren, glas, beslag en opties. De prijs volgt meteen.|— configurez chaque fenêtre ou porte : matériau, système, type, dimensions, couleurs, vitrage, quincaillerie et options. Le prix suit en direct.
— check totals, discount and VAT, then download the offer.|— controleer totalen, korting en btw en download de offerte.|— vérifiez totaux, remise et TVA, puis téléchargez l'offre.
Enter the client name first.|Vul eerst de naam van de klant in.|Saisissez d'abord le nom du client.
No products yet|Nog geen producten|Pas encore de produits
+ Configure a window or door|+ Raam of deur configureren|+ Configurer une fenêtre ou une porte
+ Several at once, or paste a list|+ Meerdere tegelijk, of plak een lijst|+ Plusieurs à la fois, ou coller une liste
+ Articles: sun protection, accessories|+ Artikelen: zonwering, toebehoren|+ Articles : protection solaire, accessoires
Select all|Alles selecteren|Tout sélectionner
Select|Selecteren|Sélectionner
Colour|Kleur|Couleur
Glass|Glas|Vitrage
Hardware|Beslag|Quincaillerie
System|Systeem|Système
Material|Materiaal|Matériau
Finish|Afwerking|Finition
Finishing|Afwerking|Finition
Placement|Plaatsing|Pose
Copy|Kopiëren|Copier
Remove|Verwijderen|Supprimer
Edit|Bewerken|Modifier
Copy & edit|Kopiëren en bewerken|Copier et modifier
Details|Details|Détails
Hide details|Details verbergen|Masquer les détails
Keep|Behouden|Garder
Confirm remove|Verwijderen bevestigen|Confirmer la suppression
One less|Eén minder|Un de moins
One more|Eén meer|Un de plus
Article|Artikel|Article
Articles|Artikelen|Articles
Done|Klaar|Terminé
Add|Toevoegen|Ajouter
Add articles|Artikelen toevoegen|Ajouter des articles
Loose items sold with the offer|Losse artikelen bij de offerte|Articles vendus avec l'offre
Update price|Prijs bijwerken|Mettre à jour le prix
Offer total|Totaal offerte|Total de l'offre
Offer discount|Korting op offerte|Remise sur l'offre
VAT|Btw|TVA
Line discounts|Lijnkortingen|Remises par ligne
Total excl. VAT|Totaal excl. btw|Total HTVA
Total incl. VAT|Totaal incl. btw|Total TVAC
Site costs|Werfkosten|Frais de chantier
Review offer →|Offerte nakijken →|Vérifier l'offre →
Variants|Varianten|Variantes
this one|deze|celle-ci
Open|Openen|Ouvrir
Make the same offer in another material, or a copy to try other glass, colours or options. Variants stay linked, so you can switch and compare with the client.|Maak dezelfde offerte in een ander materiaal, of een kopie om ander glas, andere kleuren of opties te proberen. Varianten blijven gekoppeld, zodat je samen met de klant kunt wisselen en vergelijken.|Créez la même offre dans un autre matériau, ou une copie pour essayer un autre vitrage, d'autres couleurs ou options. Les variantes restent liées : vous pouvez basculer et comparer avec le client.
e.g. Triple glass|bv. Driedubbel glas|p. ex. Triple vitrage
Name of the copy|Naam van de kopie|Nom de la copie
Copy as variant|Kopiëren als variant|Copier comme variante
Placement and site|Plaatsing en werf|Pose et chantier
Hours come from each product’s placement tab. Override any value for this offer; leave it empty to use the calculation.|De uren komen uit het tabblad Plaatsing van elk product. Overschrijf een waarde voor deze offerte, of laat leeg voor de berekening.|Les heures proviennent de l'onglet Pose de chaque produit. Modifiez une valeur pour cette offre ou laissez vide pour le calcul.
Fitters on site|Plaatsers op de werf|Poseurs sur chantier
Total person-hours|Totaal manuren|Total heures-homme
Days on site|Dagen op de werf|Jours sur chantier
pers.|pers.|pers.
days|dagen|jours
day|dag|jour
Waste container 6 m³|Afvalcontainer 6 m³|Conteneur à déchets 6 m³
Waste container 10 m³|Afvalcontainer 10 m³|Conteneur à déchets 10 m³
Crane|Kraan|Grue
Glass lifter / vacuum lift|Glaslifter / vacuümheffer|Lève-vitre / ventouse
Travel and mobilisation|Verplaatsing en opstart|Déplacement et mobilisation
Quick entry|Snelle invoer|Saisie rapide
Type row by row, or paste a measurement list. Enter in the last row adds a new one.|Typ rij per rij, of plak een opmeetlijst. Enter in de laatste rij voegt een nieuwe toe.|Saisissez ligne par ligne, ou collez une liste de mesures. Entrée sur la dernière ligne en ajoute une.
Paste a measurement list|Plak een opmeetlijst|Coller une liste de mesures
Read list|Lijst lezen|Lire la liste
Read with AI|Lezen met AI|Lire avec l'IA
Reading…|Bezig met lezen…|Lecture…
Rows are added below for you to check.|De rijen komen hieronder, zodat je ze kunt nakijken.|Les lignes sont ajoutées ci-dessous pour vérification.
Paste a list first.|Plak eerst een lijst.|Collez d'abord une liste.
Colour (both sides)|Kleur (beide zijden)|Couleur (deux faces)
Inside finishing|Binnenafwerking|Finition intérieure
Outside finishing|Buitenafwerking|Finition extérieure
Supply and placement|Levering en plaatsing|Fourniture et pose
Supply only|Enkel levering|Fourniture seule
Room|Ruimte|Pièce
Type|Type|Type
Width|Breedte|Largeur
Height|Hoogte|Hauteur
Qty|Aantal|Qté
Price|Prijs|Prix
+ Row|+ Rij|+ Ligne
Cancel|Annuleren|Annuler
Outside grid|Buiten raster|Hors grille
Configuration|Configuratie|Configuration
Dimensions|Afmetingen|Dimensions
Options|Opties|Options
PVC|PVC|PVC
ALU|ALU|ALU
Wood|Hout|Bois
WOOD|HOUT|BOIS
Aluminium|Aluminium|Aluminium
Best insulation per euro, foil colours|Beste isolatie per euro, folies|Meilleure isolation par euro, films décoratifs
Slim profiles, large sizes, any RAL colour|Slanke profielen, grote maten, elke RAL-kleur|Profilés fins, grandes dimensions, toute teinte RAL
Warm look, meranti or oak, stains|Warme uitstraling, meranti of eik, beitsen|Aspect chaleureux, méranti ou chêne, lasures
Product type|Producttype|Type de produit
Windows|Ramen|Fenêtres
Doors|Deuren|Portes
Sliding doors|Schuifdeuren|Portes coulissantes
Fixed window|Vast raam|Châssis fixe
Tilt-turn window|Draai-kipraam|Fenêtre oscillo-battante
Turn window|Draairaam|Fenêtre battante
Tilt window (bottom-hung)|Kipraam|Fenêtre à soufflet
Double sash, no mullion|Dubbel raam zonder middenstijl|Fenêtre double sans meneau
Fixed + tilt-turn|Vast + draai-kip|Fixe + oscillo-battant
Three-part window|Driedelig raam|Fenêtre en trois parties
Tilt-turn with top light|Draai-kip met bovenlicht|Oscillo-battant avec imposte
Entrance door|Voordeur|Porte d'entrée
Entrance door + side light|Voordeur met zijlicht|Porte d'entrée avec partie latérale
Terrace door (tilt-turn)|Terrasdeur (draai-kip)|Porte-fenêtre (oscillo-battante)
French door, double|Dubbele terrasdeur|Porte-fenêtre double
Lift & slide door|Hefschuifdeur|Porte levante-coulissante
Tilt & slide door|Kip-schuifdeur|Porte oscillo-coulissante
Opening direction|Draairichting|Sens d'ouverture
As drawn|Zoals getekend|Comme dessiné
Mirrored|Gespiegeld|Inversé
Hinges left|Scharnieren links|Paumelles à gauche
Hinges right|Scharnieren rechts|Paumelles à droite
Seen from inside|Gezien van binnen|Vu de l'intérieur
Outer frame size|Buitenmaat kader|Dimensions hors cadre
Top light height|Hoogte bovenlicht|Hauteur de l'imposte
Width in millimetres|Breedte in millimeter|Largeur en millimètres
Height in millimetres|Hoogte in millimeter|Hauteur en millimètres
Top light height in millimetres|Hoogte bovenlicht in millimeter|Hauteur de l'imposte en millimètres
Position and quantity|Positie en aantal|Position et quantité
Position / room|Positie / ruimte|Position / pièce
e.g. Kitchen|bv. Keuken|p. ex. Cuisine
Quantity|Aantal|Quantité
Line discount|Lijnkorting|Remise ligne
Outside|Buiten|Extérieur
Inside|Binnen|Intérieur
Same colour as outside|Zelfde kleur als buiten|Même couleur qu'à l'extérieur
Same as outside|Zelfde als buiten|Comme l'extérieur
Inside follows when it is the same.|Binnen volgt als het dezelfde kleur is.|L'intérieur suit s'il est identique.
Standard|Standaard|Standard
Foil|Folie|Film décoratif
Lacquer (RAL)|Lak (RAL)|Laque (RAL)
RAL code|RAL-code|Code RAL
RAL code for lacquer|RAL-code voor lak|Code RAL pour la laque
Any RAL code is possible. The lacquer surcharge comes from the price book.|Elke RAL-code is mogelijk. De meerprijs voor lak komt uit het prijsboek.|Tout code RAL est possible. Le supplément laque provient du tarif.
Lacquer, any RAL colour|Lak, elke RAL-kleur|Laque, toute teinte RAL
White (RAL 9016)|Wit (RAL 9016)|Blanc (RAL 9016)
Cream white|Crèmewit|Blanc crème
Anthracite grey (RAL 7016)|Antracietgrijs (RAL 7016)|Gris anthracite (RAL 7016)
Anthracite grey smooth|Antracietgrijs glad|Gris anthracite lisse
Black structure|Zwart structuur|Noir structuré
Basalt grey|Basaltgrijs|Gris basalte
Quartz grey|Kwartsgrijs|Gris quartz
Silver grey|Zilvergrijs|Gris argent
Cream white foil|Crèmewit folie|Film blanc crème
Dark green|Donkergroen|Vert foncé
Golden oak|Golden oak|Chêne doré
Irish oak|Irish oak|Chêne irlandais
Winchester oak|Winchester eik|Chêne Winchester
Mahogany|Mahonie|Acajou
Traffic white matt (RAL 9016)|Verkeerswit mat (RAL 9016)|Blanc signalisation mat (RAL 9016)
Anthracite structure (RAL 7016)|Antraciet structuur (RAL 7016)|Anthracite structuré (RAL 7016)
Black structure (RAL 9005)|Zwart structuur (RAL 9005)|Noir structuré (RAL 9005)
Anodised natural|Natuurlijk geanodiseerd|Anodisé naturel
Wood decor|Houtdecor|Décor bois
Oak decor|Eikdecor|Décor chêne
Clear lacquer|Blanke lak|Vernis incolore
Teak stain|Teakbeits|Lasure teck
Natural oak oil|Natuurlijke eikolie|Huile chêne naturel
Opaque white (RAL 9016)|Dekkend wit (RAL 9016)|Blanc opaque (RAL 9016)
Opaque anthracite (RAL 7016)|Dekkend antraciet (RAL 7016)|Anthracite opaque (RAL 7016)
Double HR++ 4/16/4, Ug 1.0|Dubbel HR++ 4/16/4, Ug 1.0|Double HR++ 4/16/4, Ug 1.0
Double HR++ 4/16/4|Dubbel HR++ 4/16/4|Double HR++ 4/16/4
Triple 4/14/4/14/4, Ug 0.6|Driedubbel 4/14/4/14/4, Ug 0.6|Triple 4/14/4/14/4, Ug 0.6
Triple 4/14/4/14/4|Driedubbel 4/14/4/14/4|Triple 4/14/4/14/4
Double safety 44.2/16/4, Ug 1.0|Dubbel veiligheidsglas 44.2/16/4, Ug 1.0|Double sécurité 44.2/16/4, Ug 1.0
Triple safety 44.2/12/4/12/4, Ug 0.6|Driedubbel veiligheidsglas 44.2/12/4/12/4, Ug 0.6|Triple sécurité 44.2/12/4/12/4, Ug 0.6
Acoustic 39 dB|Akoestisch 39 dB|Acoustique 39 dB
Satin / obscure glass|Mat / ondoorzichtig glas|Verre satiné / opaque
Solar control|Zonwerend|Contrôle solaire
Included|Inbegrepen|Inclus
Not included|Niet inbegrepen|Non inclus
Sills|Vensterbanken|Tablettes et seuils
Hinges, handles and security|Scharnieren, krukken en beveiliging|Paumelles, poignées et sécurité
Handles|Krukken|Poignées
Hinges|Scharnieren|Paumelles
Security|Beveiliging|Sécurité
Standard handle|Standaard kruk|Poignée standard
Lockable handle|Afsluitbare kruk|Poignée à clé
Design handle, stainless|Designkruk, inox|Poignée design, inox
Standard fittings|Standaard beslag|Ferrure standard
RC1 (mushroom cams)|RC1 (paddenstoelnokken)|RC1 (galets champignon)
RC2 burglary resistant|RC2 inbraakwerend|RC2 anti-effraction
Visible hinges|Zichtbare scharnieren|Paumelles visibles
Concealed hinges|Verdekte scharnieren|Paumelles invisibles
Door hardware|Deurbeslag|Quincaillerie de porte
Door panel|Deurpaneel|Panneau de porte
Lock|Slot|Serrure
Door handle|Deurkruk|Poignée de porte
Threshold|Dorpel|Seuil
Glass with transom|Glas met dwarsregel|Vitrage avec traverse
Insulated panel, smooth|Geïsoleerd paneel, glad|Panneau isolé, lisse
Panel with grooves|Paneel met groeven|Panneau rainuré
Panel with decorative glass|Paneel met decoratief glas|Panneau avec verre décoratif
3-point mechanical lock|Mechanisch 3-puntsslot|Serrure mécanique 3 points
5-point automatic lock|Automatisch 5-puntsslot|Serrure automatique 5 points
Electronic lock with fingerprint|Elektronisch slot met vingerafdruk|Serrure électronique à empreinte digitale
Lever / lever|Kruk / kruk|Béquille / béquille
Pull bar 600 mm outside|Trekker 600 mm buiten|Barre de tirage 600 mm extérieur
Pull bar 1200 mm outside|Trekker 1200 mm buiten|Barre de tirage 1200 mm extérieur
Standard aluminium threshold|Standaard aluminium dorpel|Seuil aluminium standard
Low threshold 20 mm (accessible)|Lage dorpel 20 mm (toegankelijk)|Seuil bas 20 mm (accessible)
Fixed glazing has no hardware.|Vast glas heeft geen beslag.|Un vitrage fixe n'a pas de quincaillerie.
Ventilation|Ventilatie|Ventilation
Insect screens|Insectenhorren|Moustiquaires
Roller shutters|Rolluiken|Volets roulants
Door accessories|Deurtoebehoren|Accessoires de porte
Ventilation grille, self-regulating|Ventilatierooster, zelfregelend|Grille de ventilation autoréglable
Ventilation grille, acoustic|Ventilatierooster, akoestisch|Grille de ventilation acoustique
Concealed vent in frame|Onzichtbare ventilatie in kader|Ventilation invisible dans le cadre
Insect screen, fixed frame|Insectenhor, vast kader|Moustiquaire, cadre fixe
Insect screen, roller|Insectenhor, rol|Moustiquaire enroulable
Insect screen door, hinged|Insectenhordeur, draaiend|Porte moustiquaire battante
Insect screen, pleated (plissé)|Insectenhor, plissé|Moustiquaire plissée
Roller shutter, top-mounted, strap|Rolluik, opbouw, met lint|Volet roulant, coffre extérieur, sangle
Roller shutter, radio motor|Rolluik, radiomotor|Volet roulant, moteur radio
Outside sill, aluminium|Buitenvensterbank, aluminium|Seuil extérieur, aluminium
Inside sill, natural stone|Binnenvensterbank, natuursteen|Tablette intérieure, pierre naturelle
Glazing bars (per field)|Roedes (per vak)|Croisillons (par champ)
Letterbox|Brievenbus|Boîte aux lettres
Door closer|Deurdranger|Ferme-porte
Kick plate, stainless|Schopplaat, inox|Plaque de protection, inox
No inside finishing|Geen binnenafwerking|Pas de finition intérieure
Plaster|Pleisterwerk|Plafonnage
PVC finishing profiles|PVC-afwerkingsprofielen|Profilés de finition PVC
MDF casing, primed|MDF-omlijsting, gegrond|Habillage MDF, apprêté
No outside finishing|Geen buitenafwerking|Pas de finition extérieure
Sealant joint|Kitvoeg|Joint de mastic
Aluminium cover profiles|Aluminium afdekprofielen|Profilés de recouvrement aluminium
Outside plaster repair|Herstel buitenpleister|Réparation d'enduit extérieur
Breakout of the old frame|Uitbraak van het oude raam|Démontage de l'ancien châssis
No breakout|Geen uitbraak|Pas de démontage
New build or opening ready|Nieuwbouw of opening klaar|Construction neuve ou baie prête
Break out old frame|Oud raam uitbreken|Démonter l'ancien châssis
Old frame material|Materiaal oud raam|Matériau de l'ancien châssis
Steel|Staal|Acier
Our fitters place the element|Onze plaatsers plaatsen het element|Nos poseurs posent l'élément
Delivered, placed by others|Geleverd, geplaatst door derden|Livré, posé par des tiers
Labour per unit|Arbeid per stuk|Main-d'œuvre par pièce
Person-hours per unit|Manuren per stuk|Heures-homme par pièce
Calculated|Berekend|Calculé
Leave empty to use the calculated time. Labour, days on site, containers and crane are totalled per offer on the Products step.|Laat leeg voor de berekende tijd. Arbeid, werfdagen, containers en kraan worden per offerte opgeteld bij de stap Producten.|Laissez vide pour le temps calculé. Main-d'œuvre, jours de chantier, conteneurs et grue sont totalisés par offre à l'étape Produits.
Finishing is priced per metre of reveal: 2 × height + width =|De afwerking wordt per meter dagkant gerekend: 2 × hoogte + breedte =|La finition est calculée par mètre d'ébrasement : 2 × hauteur + largeur =
Configuration tabs|Configuratietabs|Onglets de configuration
Size|Maat|Dimensions
Uw (estimate)|Uw (schatting)|Uw (estimation)
Technical checks|Technische controles|Contrôles techniques
Price per unit|Prijs per stuk|Prix unitaire
Unit price excl. VAT|Eenheidsprijs excl. btw|Prix unitaire HTVA
Add to offer|Toevoegen aan offerte|Ajouter à l'offre
Add + next|Toevoegen + volgende|Ajouter + suivant
+ Next|+ Volgende|+ Suivant
Update line|Lijn bijwerken|Mettre à jour la ligne
Update|Bijwerken|Mettre à jour
Add this line and start the next one with the same specification|Voeg deze lijn toe en start de volgende met dezelfde specificatie|Ajouter cette ligne et commencer la suivante avec la même spécification
Fix the technical check above before adding.|Los de technische controle hierboven op voor je toevoegt.|Corrigez le contrôle technique ci-dessus avant d'ajouter.
Check failed|Controle mislukt|Contrôle échoué
Size outside grid|Maat buiten raster|Dimensions hors grille
Sample prices|Voorbeeldprijzen|Prix d'exemple
All technical checks passed.|Alle technische controles in orde.|Tous les contrôles techniques sont réussis.
RC2 security needs safety glass (44.2) to count.|RC2-beveiliging vraagt veiligheidsglas (44.2).|La sécurité RC2 nécessite un vitrage de sécurité (44.2).
No price grid for this system and product type.|Geen prijsraster voor dit systeem en producttype.|Pas de grille de prix pour ce système et ce type de produit.
This size has no price in the grid.|Deze maat heeft geen prijs in het raster.|Cette dimension n'a pas de prix dans la grille.
Choose a system and product type.|Kies een systeem en producttype.|Choisissez un système et un type de produit.
Bicolour execution|Bicolor uitvoering|Exécution bicolore
Disposal of old frame|Afvoer oud raam|Évacuation de l'ancien châssis
Bill of materials per unit (approximate)|Stuklijst per stuk (benaderend)|Nomenclature par pièce (approximative)
Group|Groep|Groupe
Item|Onderdeel|Élément
Unit|Eenheid|Unité
Profiles|Profielen|Profilés
Outer frame|Buitenkader|Cadre dormant
Mullion|Middenstijl|Meneau
Transom|Dwarsregel|Traverse
Sash profile|Vleugelprofiel|Profilé d'ouvrant
Glass area|Glasoppervlakte|Surface vitrée
Glazing bead|Glaslat|Parclose
Labour|Arbeid|Main-d'œuvre
Tilt-turn sash|Draai-kipvleugel|Ouvrant oscillo-battant
Turn sash|Draaivleugel|Ouvrant battant
Tilt sash|Kipvleugel|Ouvrant à soufflet
Door leaf|Deurvleugel|Vantail de porte
Lift & slide sash|Hefschuifvleugel|Vantail levant-coulissant
Tilt & slide sash|Kip-schuifvleugel|Vantail oscillo-coulissant
Hardware set|Beslagset|Kit de quincaillerie
Sun protection|Zonwering|Protection solaire
Controls|Bediening|Commandes
Service|Service|Service
Zip screen, motorised, up to 2.5 m²|Zipscreen, gemotoriseerd, tot 2,5 m²|Screen zip motorisé, jusqu'à 2,5 m²
Exterior venetian blind, motorised|Buitenjaloezie, gemotoriseerd|Brise-soleil orientable motorisé
Folding-arm awning 4 m|Knikarmscherm 4 m|Store banne à bras 4 m
Louvred pergola, per m²|Lamellenpergola, per m²|Pergola bioclimatique, par m²
Remote control, 5 channels|Afstandsbediening, 5 kanalen|Télécommande 5 canaux
Wind and sun sensor|Wind- en zonsensor|Capteur vent et soleil
Maintenance kit|Onderhoudsset|Kit d'entretien
Yearly service visit|Jaarlijks onderhoudsbezoek|Visite d'entretien annuelle
Sun|Zon|Soleil
Status|Status|Statut
Download offer (.html)|Offerte downloaden (.html)|Télécharger l'offre (.html)
Lines (.csv)|Lijnen (.csv)|Lignes (.csv)
Bill of materials (.csv)|Stuklijst (.csv)|Nomenclature (.csv)
Edit products|Producten bewerken|Modifier les produits
Offer language|Taal offerte|Langue de l'offre
Compare variants|Varianten vergelijken|Comparer les variantes
Show this to the client and let them choose|Toon dit aan de klant en laat kiezen|Montrez ceci au client et laissez-le choisir
Placement and site costs|Plaatsing en werfkosten|Pose et frais de chantier
Average Uw|Gemiddelde Uw|Uw moyen
Units|Stuks|Pièces
Client chooses this|Klant kiest deze|Le client choisit celle-ci
Chosen|Gekozen|Choisie
Choice saved: the other variants are marked lost.|Keuze bewaard: de andere varianten staan op verloren.|Choix enregistré : les autres variantes sont marquées perdues.
Notes on the offer|Opmerkingen bij de offerte|Remarques sur l'offre
Delivery time, payment terms, site conditions…|Levertermijn, betalingsvoorwaarden, werfomstandigheden…|Délai de livraison, conditions de paiement, conditions de chantier…
Open the downloaded file in your browser to print it or save it as PDF.|Open het gedownloade bestand in je browser om het af te drukken of als pdf te bewaren.|Ouvrez le fichier téléchargé dans votre navigateur pour l'imprimer ou l'enregistrer en PDF.
For|Voor|Pour
Description|Omschrijving|Description
Total|Totaal|Total
Notes|Opmerkingen|Remarques
Date and signature client, “read and approved”|Datum en handtekening klant, “gelezen en goedgekeurd”|Date et signature du client, « lu et approuvé »
Indicative offer based on sample prices.|Indicatieve offerte op basis van voorbeeldprijzen.|Offre indicative basée sur des prix d'exemple.
Windows · Doors · Sun protection|Ramen · Deuren · Zonwering|Fenêtres · Portes · Protection solaire
Price grids|Prijsrasters|Grilles de prix
Systems|Systemen|Systèmes
Colours|Kleuren|Couleurs
Door parts|Deuronderdelen|Pièces de porte
Finish & placement|Afwerking en plaatsing|Finition et pose
Import / export|Import / export|Import / export
You can view the price book. Only editors of this page can change it.|Je kunt het prijsboek bekijken. Enkel bewerkers van deze pagina kunnen het wijzigen.|Vous pouvez consulter le tarif. Seuls les éditeurs de cette page peuvent le modifier.
Product type|Producttype|Type de produit
Grid|Raster|Grille
Base price in € excl. VAT for the outer frame size, white or standard colour, standard glass and hardware. A size is priced at the next width and height step up. Leave a cell empty where the size cannot be made.|Basisprijs in € excl. btw voor de buitenmaat, wit of standaardkleur, standaard glas en beslag. Een maat wordt geprijsd op de volgende breedte- en hoogtestap. Laat een cel leeg als de maat niet kan.|Prix de base en € HTVA pour les dimensions hors cadre, blanc ou couleur standard, vitrage et quincaillerie standard. Une dimension est chiffrée au palier de largeur et de hauteur supérieur. Laissez une cellule vide si la dimension est impossible.
Save grid|Raster bewaren|Enregistrer la grille
Import CSV…|CSV importeren…|Importer un CSV…
Reset to sample|Terug naar voorbeeld|Revenir à l'exemple
Download CSV|CSV downloaden|Télécharger le CSV
CSV layout: first row|CSV-opbouw: eerste rij|Format CSV : première ligne
with the widths, then one row per height:|met de breedtes, dan één rij per hoogte:|avec les largeurs, puis une ligne par hauteur :
. Separator ; , or tab.|. Scheidingsteken ; , of tab.|. Séparateur ; , ou tabulation.
Grid saved.|Raster bewaard.|Grille enregistrée.
Sample grid restored. Save to keep it.|Voorbeeldraster hersteld. Bewaar om het te behouden.|Grille d'exemple restaurée. Enregistrez pour la conserver.
Name|Naam|Nom
Supplier / series|Leverancier / reeks|Fournisseur / série
Depth mm|Diepte mm|Profondeur mm
Max sash W|Max. breedte vleugel|Largeur max. ouvrant
Max sash H|Max. hoogte vleugel|Hauteur max. ouvrant
Max sash kg|Max. kg vleugel|Poids max. ouvrant kg
Max slide kg|Max. kg schuifvleugel|Poids max. coulissant kg
Max glass m²|Max. glas m²|Vitrage max. m²
Sample factor|Voorbeeldfactor|Facteur d'exemple
Active|Actief|Actif
Rename systems to your final product names. Factor scales the sample grids only.|Hernoem de systemen naar je definitieve productnamen. De factor schaalt enkel de voorbeeldrasters.|Renommez les systèmes avec vos noms définitifs. Le facteur ne s'applique qu'aux grilles d'exemple.
Technical targets|Technische doelen|Objectifs techniques
Uw target for the checks|Uw-doel voor de controles|Objectif Uw pour les contrôles
Sash limits and the Uw target drive the technical checks in the configurator. All values are samples until set from the supplier documentation.|Vleugellimieten en het Uw-doel sturen de technische controles in de configurator. Alle waarden zijn voorbeelden tot ze uit de documentatie van de leverancier komen.|Les limites d'ouvrant et l'objectif Uw pilotent les contrôles techniques. Toutes les valeurs sont des exemples jusqu'à leur reprise de la documentation fournisseur.
Save changes|Wijzigingen bewaren|Enregistrer les modifications
Save company details|Bedrijfsgegevens bewaren|Enregistrer les coordonnées
Price book saved.|Prijsboek bewaard.|Tarif enregistré.
Lacquer coefficient|Lakcoëfficiënt|Coefficient laque
Multiplier on the grid price for each lacquered side (any RAL code). 1.22 means +22%. Used in the background; the client only sees the resulting amount.|Vermenigvuldiger op de rasterprijs per gelakte zijde (elke RAL-code). 1,22 betekent +22%. Werkt op de achtergrond; de klant ziet enkel het bedrag.|Multiplicateur sur le prix de grille par face laquée (tout code RAL). 1,22 signifie +22 %. Appliqué en arrière-plan ; le client ne voit que le montant.
Type std = standard, foil = foil, lacq = lacquer in any RAL code (priced with the coefficient above). Surcharge in % on the grid price, per side.|Type std = standaard, foil = folie, lacq = lak in elke RAL-code (geprijsd met de coëfficiënt hierboven). Meerprijs in % op de rasterprijs, per zijde.|Type std = standard, foil = film, lacq = laque en tout code RAL (chiffrée avec le coefficient ci-dessus). Supplément en % du prix de grille, par face.
Surcharge %|Meerprijs %|Supplément %
Surcharge per m² of element size. Ug feeds the Uw estimate, kg/m² the sash weight check.|Meerprijs per m² elementmaat. Ug voedt de Uw-schatting, kg/m² de gewichtscontrole van de vleugel.|Supplément par m² d'élément. Ug alimente l'estimation Uw, kg/m² le contrôle de poids de l'ouvrant.
Price per opening sash.|Prijs per opendraaiende vleugel.|Prix par ouvrant.
Price per entrance door.|Prijs per voordeur.|Prix par porte d'entrée.
Door panels|Deurpanelen|Panneaux de porte
Door locks|Deursloten|Serrures de porte
Door handles|Deurkrukken|Poignées de porte
Thresholds|Dorpels|Seuils
Category|Categorie|Catégorie
Start cost|Startkost|Coût de départ
Minimum|Minimum|Minimum
For (window,door,slide)|Voor (window,door,slide)|Pour (window,door,slide)
Unit: pc = per piece, m = per metre of width, m2 = per m² of element. Options in the same group exclude each other.|Eenheid: pc = per stuk, m = per meter breedte, m2 = per m² element. Opties in dezelfde groep sluiten elkaar uit.|Unité : pc = par pièce, m = par mètre de largeur, m2 = par m² d'élément. Les options d'un même groupe s'excluent.
Loose items sold with an offer: sun protection, controls, service. Unit pc or m2.|Losse artikelen bij een offerte: zonwering, bediening, service. Eenheid pc of m2.|Articles vendus avec une offre : protection solaire, commandes, service. Unité pc ou m2.
Labour|Arbeid|Main-d'œuvre
Person-hours per element = base hours + hours per m² (placement) + breakout hours × old frame factor. Labour is charged per offer at the hourly rate.|Manuren per element = basisuren + uren per m² (plaatsing) + uitbraakuren × factor oud raam. Arbeid wordt per offerte aan het uurtarief aangerekend.|Heures-homme par élément = heures de base + heures par m² (pose) + heures de démontage × facteur de l'ancien châssis. La main-d'œuvre est facturée par offre au taux horaire.
Hourly rate|Uurtarief|Taux horaire
Default fitters|Standaard aantal plaatsers|Nombre de poseurs par défaut
Hours per day|Uren per dag|Heures par jour
Base hours window|Basisuren raam|Heures de base fenêtre
Base hours door|Basisuren deur|Heures de base porte
Base hours sliding door|Basisuren schuifdeur|Heures de base porte coulissante
Breakout window|Uitbraak raam|Démontage fenêtre
Breakout door|Uitbraak deur|Démontage porte
Breakout sliding door|Uitbraak schuifdeur|Démontage porte coulissante
Extra hours per m²|Extra uren per m²|Heures supplémentaires par m²
Disposal per old frame|Afvoer per oud raam|Évacuation par ancien châssis
Price per metre of reveal (2 × height + width).|Prijs per meter dagkant (2 × hoogte + breedte).|Prix par mètre d'ébrasement (2 × hauteur + largeur).
Old frame materials|Materialen oude ramen|Matériaux des anciens châssis
Factor on the breakout hours.|Factor op de uitbraakuren.|Facteur sur les heures de démontage.
Factor|Factor|Facteur
Per offer. Unit pc, h or day. Minimum = lowest charge. Follows days = quantity defaults to the days on site.|Per offerte. Eenheid pc, h of day. Minimum = laagste aanrekening. Volgt dagen = aantal volgt standaard de werfdagen.|Par offre. Unité pc, h ou day. Minimum = facturation minimale. Suit les jours = la quantité suit par défaut les jours de chantier.
Follows days|Volgt dagen|Suit les jours
Full price book|Volledig prijsboek|Tarif complet
Download the complete price book (systems, grids, colours, glass, hardware and options) as JSON, edit it or generate it from your ERP, and upload it again. An upload replaces the current price book for everyone using this page.|Download het volledige prijsboek (systemen, rasters, kleuren, glas, beslag en opties) als JSON, bewerk het of genereer het vanuit je ERP en laad het opnieuw op. Een upload vervangt het prijsboek voor iedereen die deze pagina gebruikt.|Téléchargez le tarif complet (systèmes, grilles, couleurs, vitrages, quincaillerie et options) en JSON, modifiez-le ou générez-le depuis votre ERP, puis rechargez-le. Un chargement remplace le tarif pour tous les utilisateurs de cette page.
Download price book (.json)|Prijsboek downloaden (.json)|Télécharger le tarif (.json)
Upload price book (.json)…|Prijsboek opladen (.json)…|Charger un tarif (.json)…
Restore sample prices|Voorbeeldprijzen terugzetten|Restaurer les prix d'exemple
Confirm: restore sample prices|Bevestig: voorbeeldprijzen terugzetten|Confirmer : restaurer les prix d'exemple
Sample prices restored.|Voorbeeldprijzen teruggezet.|Prix d'exemple restaurés.
Price book uploaded.|Prijsboek opgeladen.|Tarif chargé.
Company on offers|Bedrijf op offertes|Société sur les offres
Company name|Bedrijfsnaam|Nom de la société
Tagline|Slogan|Slogan
Default validity (days)|Standaard geldigheid (dagen)|Validité par défaut (jours)
The language of the app on this device.|De taal van de app op dit toestel.|La langue de l'application sur cet appareil.
Default language of new offers for the client. You can still change it per offer on the Offer step.|Standaardtaal van nieuwe offertes voor de klant. Je kunt ze per offerte nog wijzigen bij de stap Offerte.|Langue par défaut des nouvelles offres pour le client. Modifiable par offre à l'étape Offre.
New offers|Nieuwe offertes|Nouvelles offres
Default VAT rate|Standaard btw-tarief|Taux de TVA par défaut
Default material|Standaardmateriaal|Matériau par défaut
Shared settings|Gedeelde instellingen|Paramètres partagés
Prices, systems, colours, the lacquer coefficient and company details are shared with everyone and live in the price book.|Prijzen, systemen, kleuren, de lakcoëfficiënt en bedrijfsgegevens zijn gedeeld met iedereen en staan in het prijsboek.|Les prix, systèmes, couleurs, le coefficient laque et les coordonnées sont partagés avec tous et se trouvent dans le tarif.
Open price book|Prijsboek openen|Ouvrir le tarif
Copied.|Gekopieerd.|Copié.
Could not delete the offer.|Kon de offerte niet verwijderen.|Impossible de supprimer l'offre.
Could not load the price book. Showing sample prices.|Kon het prijsboek niet laden. Voorbeeldprijzen worden getoond.|Impossible de charger le tarif. Les prix d'exemple sont affichés.
Downloads are not available here. Copy the content instead.|Downloaden kan hier niet. Kopieer de inhoud.|Le téléchargement n'est pas disponible ici. Copiez le contenu.
Line duplicated.|Lijn gekopieerd.|Ligne copiée.
Line removed.|Lijn verwijderd.|Ligne supprimée.
Live updates stopped. Reload the page to reconnect.|Live updates gestopt. Herlaad de pagina om opnieuw te verbinden.|Mises à jour en direct arrêtées. Rechargez la page pour vous reconnecter.
No sizes found. Write each opening on its own line, like “Kitchen 1000 x 1200”.|Geen maten gevonden. Zet elke opening op een eigen lijn, zoals “Keuken 1000 x 1200”.|Aucune dimension trouvée. Écrivez chaque baie sur sa propre ligne, comme « Cuisine 1000 x 1200 ».
Press Ctrl+C to copy.|Druk op Ctrl+C om te kopiëren.|Appuyez sur Ctrl+C pour copier.
Price updated.|Prijs bijgewerkt.|Prix mis à jour.
Nothing to change for the selected lines.|Niets te wijzigen voor de geselecteerde lijnen.|Rien à modifier pour les lignes sélectionnées.
Added to the offer.|Toegevoegd aan de offerte.|Ajouté à l'offre.
Line updated.|Lijn bijgewerkt.|Ligne mise à jour.
Could not save the offer. Try again.|Kon de offerte niet bewaren. Probeer opnieuw.|Impossible d'enregistrer l'offre. Réessayez.
Storage is full. Delete old offers first.|Opslag is vol. Verwijder eerst oude offertes.|Stockage plein. Supprimez d'abord d'anciennes offres.
Only editors of this page can change the price book.|Enkel bewerkers van deze pagina kunnen het prijsboek wijzigen.|Seuls les éditeurs de cette page peuvent modifier le tarif.
Could not save the price book.|Kon het prijsboek niet bewaren.|Impossible d'enregistrer le tarif.
A download is already waiting for your answer.|Er wacht al een download op je antwoord.|Un téléchargement attend déjà votre réponse.
The file could not be saved.|Het bestand kon niet bewaard worden.|Le fichier n'a pas pu être enregistré.
Placement|Plaatsing|Pose
Discount|Korting|Remise
Settings|Instellingen|Paramètres
Close|Sluiten|Fermer
English|English|English
Nederlands|Nederlands|Nederlands
Français|Français|Français
Wood|Hout|Bois
Profiles|Profielen|Profilés
Options|Opties|Options
Articles|Artikelen|Articles
Glass|Glas|Vitrage
Matching system, closest colour|Passend systeem, dichtste kleur|Système correspondant, couleur la plus proche
Offer variants|Offertevarianten|Variantes de l'offre
None|Geen|Aucune
+ Add row|+ Rij toevoegen|+ Ajouter une ligne
Remove row|Rij verwijderen|Supprimer la ligne
Kitchen|Keuken|Cuisine
Loading WinVista|WinVista wordt geladen|Chargement de WinVista
`.trim().split('\n');
for (const r of rows) { const [en, nl, fr] = r.split('|'); if (fr == null) continue; I18N.nl[en] = nl; I18N.fr[en] = fr; }
I18N.nl['Kitchen 1000 x 1200 tilt-turn 2 pcs\nLiving room fixed 2400x1500\nBack door 90 x 215 cm'] = 'Keuken 1000 x 1200 draai-kip 2 st\nLiving vast 2400x1500\nAchterdeur 90 x 215 cm';
I18N.fr['Kitchen 1000 x 1200 tilt-turn 2 pcs\nLiving room fixed 2400x1500\nBack door 90 x 215 cm'] = 'Cuisine 1000 x 1200 oscillo-battant 2 pc\nSéjour fixe 2400x1500\nPorte arrière 90 x 215 cm';
for (const l of ['nl', 'fr']) for (const [k, v] of Object.entries(I18N[l])) I18L[l][k.toLowerCase()] = v;

const P = (re, nl, fr) => I18P.push([re, { nl, fr }]);
const n2 = (n, one, many) => +n === 1 ? one : many;
P(/^(\d+) of (\d+) selected$/, (a, b) => `${a} van ${b} geselecteerd`, (a, b) => `${a} sur ${b} sélectionnées`);
P(/^of (\d+) selected$/, a => `van ${a} geselecteerd`, a => `sur ${a} sélectionnées`);
P(/^Applies to (\d+) selected lines? at once$/, a => `Geldt voor ${a} geselecteerde lijn${n2(a, '', 'en')} tegelijk`, a => `S'applique à ${a} ligne${n2(a, '', 's')} sélectionnée${n2(a, '', 's')}`);
P(/^Confirm remove (\d+)$/, a => `Verwijderen bevestigen (${a})`, a => `Confirmer la suppression (${a})`);
P(/^Add (\d*) ?lines? to offer$/, a => `${a ? a + ' ' : ''}lijn${n2(a, '', 'en')} toevoegen aan offerte`, a => `Ajouter ${a ? a + ' ' : ''}ligne${n2(a, '', 's')} à l'offre`);
P(/^Products \((\d+) units?\)$/, a => `Producten (${a} stuks)`, a => `Produits (${a} pièces)`);
P(/^(\d+) units?$/, a => `${a} stuks`, a => `${a} pièce${n2(a, '', 's')}`);
P(/^Placement ([\d,.]+) h$/, a => `Plaatsing ${a} u`, a => `Pose ${a} h`);
P(/^([\d,.]+) h$/, a => `${a} u`, a => `${a} h`);
P(/^([\d,.]+) h per unit$/, a => `${a} u per stuk`, a => `${a} h par pièce`);
P(/^([\d,.]+) h × (\d+) = ([\d,.]+) h$/, (a, b, c) => `${a} u × ${b} = ${c} u`, (a, b, c) => `${a} h × ${b} = ${c} h`);
P(/^([\d,.]+) h × (.+)\/h =$/, (a, b) => `${a} u × ${b}/u =`, (a, b) => `${a} h × ${b}/h =`);
P(/^(\d+(?:[.,]\d+)?) days? with (\d+) fitters$/, (a, b) => `${a} dag${n2(a, '', 'en')} met ${b} plaatsers`, (a, b) => `${a} jour${n2(a, '', 's')} avec ${b} poseurs`);
P(/^([\d,.]+) (pc|day|days|h)$/, (a, u) => `${a} ${({ pc: 'st', day: 'dag', days: 'dagen', h: 'u' })[u]}`, (a, u) => `${a} ${({ pc: 'pc', day: 'jour', days: 'jours', h: 'h' })[u]}`);
P(/^VAT ([\d,.]+) ?%$/, a => `Btw ${a}%`, a => `TVA ${a} %`);
P(/^VAT (.+)$/, a => `Btw ${a}`, a => `TVA ${a}`);
P(/^Discount ([\d,.]+)%$/, a => `Korting ${a}%`, a => `Remise ${a} %`);
P(/^Offer discount ([\d,.]+)%$/, a => `Korting op offerte ${a}%`, a => `Remise sur l'offre ${a} %`);
P(/^valid until (.+)$/, a => `geldig tot ${a}`, a => `valable jusqu'au ${a}`);
P(/^(\d+) opening sash(es)?$/, a => `${a} opendraaiende vleugel${n2(a, '', 's')}`, a => `${a} ouvrant${n2(a, '', 's')}`);
P(/^Next: (.+) →$/, a => `Volgende: ${tt(a)} →`, a => `Suivant : ${tt(a)} →`);
P(/^← (.+)$/, a => `← ${tt(a)}`, a => `← ${tt(a)}`);
P(/^In (ALU|PVC|Wood)$/, a => `In ${tt(a)}`, a => `En ${tt(a)}`);
P(/^All to (.+)$/, a => `Alles naar ${tt(a)}`, a => `Tout en ${tt(a)}`);
P(/^Break out (.+)$/, a => `${tt(a.charAt(0).toUpperCase() + a.slice(1))} uitbreken`, a => `Démonter ${tt(a).toLowerCase()}`);
P(/^× ([\d,.]+) breakout time$/, a => `× ${a} uitbraaktijd`, a => `× ${a} temps de démontage`);
P(/^Includes disposal (.+)\/unit$/, a => `Inclusief afvoer ${a}/stuk`, a => `Évacuation comprise ${a}/pièce`);
P(/^Outside ([\d–-]+) mm$/, a => `Buiten ${a} mm`, a => `Hors ${a} mm`);
P(/^Width ([\d–-]+) mm · height ([\d–-]+) mm\. Prices follow the next grid step up\.$/, (a, b) => `Breedte ${a} mm · hoogte ${b} mm. Prijzen volgen de volgende rasterstap.`, (a, b) => `Largeur ${a} mm · hauteur ${b} mm. Les prix suivent le palier supérieur.`);
P(/^Size outside the price grid: width ([\d–-]+) mm, height ([\d–-]+) mm\.$/, (a, b) => `Maat buiten het prijsraster: breedte ${a} mm, hoogte ${b} mm.`, (a, b) => `Dimensions hors grille : largeur ${a} mm, hauteur ${b} mm.`);
P(/^(\d+) widths × (\d+) heights$/, (a, b) => `${a} breedtes × ${b} hoogtes`, (a, b) => `${a} largeurs × ${b} hauteurs`);
P(/^Uw from (.+)$/, a => `Uw vanaf ${a}`, a => `Uw à partir de ${a}`);
P(/^Different colours inside and outside: (.+)$/, a => `Andere kleur binnen en buiten: ${a}`, a => `Couleurs différentes intérieur et extérieur : ${a}`);
P(/^Colour (.+) outside \/ (.+) inside$/, (a, b) => `Kleur ${tt(a)} buiten / ${tt(b)} binnen`, (a, b) => `Couleur ${tt(a)} extérieur / ${tt(b)} intérieur`);
P(/^Colour (outside|inside): (.+)$/, (s, a) => `Kleur ${s === 'outside' ? 'buiten' : 'binnen'}: ${tt(a)}`, (s, a) => `Couleur ${s === 'outside' ? 'extérieure' : 'intérieure'} : ${tt(a)}`);
P(/^Colour (.+)$/, a => `Kleur ${tt(a)}`, a => `Couleur ${tt(a)}`);
P(/^Foil (.+)$/, a => `Folie ${tt(a)}`, a => `Film ${tt(a)}`);
P(/^Lacquer RAL (\S+) (outside|inside)$/, (r, s) => `Lak RAL ${r} ${s === 'outside' ? 'buiten' : 'binnen'}`, (r, s) => `Laque RAL ${r} ${s === 'outside' ? 'extérieur' : 'intérieur'}`);
P(/^Lacquer RAL (\S+)$/, r => `Lak RAL ${r}`, r => `Laque RAL ${r}`);
P(/^Glazing: (.+)$/, a => `Beglazing: ${tt(a)}`, a => `Vitrage : ${tt(a)}`);
P(/^Inside finishing: (.+)$/, a => `Binnenafwerking: ${tt(a)}`, a => `Finition intérieure : ${tt(a)}`);
P(/^Outside finishing: (.+)$/, a => `Buitenafwerking: ${tt(a)}`, a => `Finition extérieure : ${tt(a)}`);
P(/^Finishing: (.+)$/, a => `Afwerking: ${a.split(', ').map(x => x.replace(/^inside (.+)$/, (m, y) => 'binnen ' + tt(y).toLowerCase()).replace(/^outside (.+)$/, (m, y) => 'buiten ' + tt(y).toLowerCase())).join(', ')}`, a => `Finition : ${a.split(', ').map(x => x.replace(/^inside (.+)$/, (m, y) => 'intérieur ' + tt(y).toLowerCase()).replace(/^outside (.+)$/, (m, y) => 'extérieur ' + tt(y).toLowerCase())).join(', ')}`);
P(/^(Placement|Supply only), breakout of old (.+) frame$/, (a, b) => `${tt(a)}, uitbraak oud ${tt(b.charAt(0).toUpperCase() + b.slice(1)).toLowerCase()} raam`, (a, b) => `${tt(a)}, démontage de l'ancien châssis ${tt(b.charAt(0).toUpperCase() + b.slice(1)).toLowerCase()}`);
P(/^(WS-[A-Z]\d+) (.+)$/, (c, n) => `${c} ${tt(n)}`, (c, n) => `${c} ${tt(n)}`);
P(/^grid (.+)$/, a => `raster ${a}`, a => `grille ${a}`);
P(/^(Outer frame) (.+)$/, (a, b) => `Buitenkader ${b}`, (a, b) => `Cadre dormant ${b}`);
P(/^(.+) (\d+ × \d+ mm)$/, (a, b) => `${tt(a)} ${b}`, (a, b) => `${tt(a)} ${b}`);
P(/^Hardware set, (.+)$/, a => `Beslagset, ${tt(a).toLowerCase()}`, a => `Kit de quincaillerie, ${tt(a).toLowerCase()}`);
P(/^(Tilt-turn sash|Turn sash|Tilt sash|Door leaf|Lift & slide sash|Tilt & slide sash) (\d+)$/, (a, b) => `${tt(a)} ${b}`, (a, b) => `${tt(a)} ${b}`);
P(/^Heaviest sash about (\d+) kg of (\d+) kg allowed\.$/, (a, b) => `Zwaarste vleugel ongeveer ${a} kg van ${b} kg toegelaten.`, (a, b) => `Ouvrant le plus lourd environ ${a} kg sur ${b} kg admis.`);
P(/^(.+?) weighs about (\d+) kg; (.+) allows (\d+) kg\. Split the element or choose lighter glass\.$/, (s, a, y, b) => `${tt(s)} weegt ongeveer ${a} kg; ${y} laat ${b} kg toe. Splits het element of kies lichter glas.`, (s, a, y, b) => `${tt(s)} pèse environ ${a} kg ; ${y} admet ${b} kg. Divisez l'élément ou choisissez un vitrage plus léger.`);
P(/^(.+?) is (\d+) mm wide; maximum (\d+) mm for (.+)\.$/, (s, a, b, y) => `${tt(s)} is ${a} mm breed; maximum ${b} mm voor ${y}.`, (s, a, b, y) => `${tt(s)} fait ${a} mm de large ; maximum ${b} mm pour ${y}.`);
P(/^(.+?) is (\d+) mm high; maximum (\d+) mm for (.+)\.$/, (s, a, b, y) => `${tt(s)} is ${a} mm hoog; maximum ${b} mm voor ${y}.`, (s, a, b, y) => `${tt(s)} fait ${a} mm de haut ; maximum ${b} mm pour ${y}.`);
P(/^Largest glass pane is ([\d.]+) m²; above ([\d.]+) m² needs a check by the glass supplier\.$/, (a, b) => `Grootste glasplaat is ${a} m²; boven ${b} m² moet de glasleverancier dit nakijken.`, (a, b) => `Le plus grand vitrage fait ${a} m² ; au-delà de ${b} m², le verrier doit vérifier.`);
P(/^Uw about ([\d.]+) W\/m²K is above the target of ([\d.]+)\. Choose triple glass or a better system\.$/, (a, b) => `Uw ongeveer ${a} W/m²K ligt boven het doel van ${b}. Kies driedubbel glas of een beter systeem.`, (a, b) => `Uw d'environ ${a} W/m²K dépasse l'objectif de ${b}. Choisissez un triple vitrage ou un meilleur système.`);
P(/^(\d+) check failed$/, a => `${a} controle mislukt`, a => `${a} contrôle échoué`);
P(/^(\d+) warnings?$/, a => `${a} waarschuwing${n2(a, '', 'en')}`, a => `${a} avertissement${n2(a, '', 's')}`);
P(/^(\d+) lines? fails? a technical check\. Open the line to fix it before the offer goes out\.$/, a => `${a} lijn${n2(a, '', 'en')} faalt op een technische controle. Open de lijn en los het op voor de offerte vertrekt.`, a => `${a} ligne${n2(a, '', 's')} échoue${n2(a, '', 'nt')} à un contrôle technique. Ouvrez la ligne pour corriger avant l'envoi de l'offre.`);
P(/^Not priced: (.+) Edit the line to fix it\.$/, a => `Niet geprijsd: ${tt(a)} Bewerk de lijn om dit op te lossen.`, a => `Non chiffré : ${tt(a)} Modifiez la ligne pour corriger.`);
P(/^The price book changed: now (.+) per unit\.$/, a => `Het prijsboek is gewijzigd: nu ${a} per stuk.`, a => `Le tarif a changé : désormais ${a} par pièce.`);
P(/^Add the first window or door for (.+), enter several at once, or paste a measurement list\.$/, a => `Voeg het eerste raam of de eerste deur toe voor ${a}, voer er meerdere tegelijk in, of plak een opmeetlijst.`, a => `Ajoutez la première fenêtre ou porte pour ${a}, saisissez-en plusieurs, ou collez une liste de mesures.`);
P(/^(.+) variant ready: (\d+) lines\.(.*)$/, (v, n, r) => `Variant ${tt(v)} klaar: ${n} lijnen.${r ? ' ' + tt(r.trim()) : ''}`, (v, n, r) => `Variante ${tt(v)} prête : ${n} lignes.${r ? ' ' + tt(r.trim()) : ''}`);
P(/^(\d+) need a check\.$/, a => `${a} moeten nagekeken worden.`, a => `${a} à vérifier.`);
P(/^Showing (.+) variant\.$/, a => `Variant ${tt(a)} getoond.`, a => `Variante ${tt(a)} affichée.`);
P(/^Added (\d+) lines?\.(.*)$/, (a, r) => `${a} lijn${n2(a, '', 'en')} toegevoegd.${r ? ' ' + tt(r.trim()) : ''}`, (a, r) => `${a} ligne${n2(a, '', 's')} ajoutée${n2(a, '', 's')}.${r ? ' ' + tt(r.trim()) : ''}`);
P(/^(\d+) outside the price grid — edit them\.$/, a => `${a} buiten het prijsraster — bewerk ze.`, a => `${a} hors grille — modifiez-les.`);
P(/^Added (.+)\.$/, a => `${tt(a)} toegevoegd.`, a => `${tt(a)} ajouté.`);
P(/^Copied (\d+) lines?\.$/, a => `${a} lijn${n2(a, '', 'en')} gekopieerd.`, a => `${a} ligne${n2(a, '', 's')} copiée${n2(a, '', 's')}.`);
P(/^Removed (\d+) lines?\.$/, a => `${a} lijn${n2(a, '', 'en')} verwijderd.`, a => `${a} ligne${n2(a, '', 's')} supprimée${n2(a, '', 's')}.`);
P(/^Line (\d+) added\. Enter the next size\.$/, a => `Lijn ${a} toegevoegd. Geef de volgende maat in.`, a => `Ligne ${a} ajoutée. Saisissez la dimension suivante.`);
P(/^(.+) changed on (\d+) lines?\.(.*)$/, (w, a, r) => `${tt(w)} gewijzigd op ${a} lijn${n2(a, '', 'en')}.${r ? ' ' + tt(r.trim()) : ''}`, (w, a, r) => `${tt(w)} modifié sur ${a} ligne${n2(a, '', 's')}.${r ? ' ' + tt(r.trim()) : ''}`);
P(/^(\d+) rows? read (.+)\. Check them before adding\.$/, (a, h) => `${a} rij${n2(a, '', 'en')} gelezen ${({ 'from the list': 'uit de lijst', 'with AI': 'met AI' })[h] || 'met de ingebouwde lezer'}. Kijk ze na voor je toevoegt.`, (a, h) => `${a} ligne${n2(a, '', 's')} lue${n2(a, '', 's')} ${({ 'from the list': 'depuis la liste', 'with AI': "avec l'IA" })[h] || 'avec le lecteur intégré'}. Vérifiez avant d'ajouter.`);
P(/^Imported (\d+) × (\d+) grid\. Save to keep it\.$/, (a, b) => `Raster ${a} × ${b} geïmporteerd. Bewaar om het te behouden.`, (a, b) => `Grille ${a} × ${b} importée. Enregistrez pour la conserver.`);
P(/^(.+) is not available in (.+); changed to (.+)\.$/, (a, m, b) => `${tt(a)} bestaat niet in ${tt(m)}; gewijzigd naar ${tt(b)}.`, (a, m, b) => `${tt(a)} n'existe pas en ${tt(m)} ; remplacé par ${tt(b)}.`);
P(/^(Room|Type|Width|Height|Quantity|Remove) row (\d+)$/, (a, n) => `${tt(a)} rij ${n}`, (a, n) => `${tt(a)} ligne ${n}`);
P(/^(Select|Edit|Quantity) line (\d+)$/, (a, n) => `${tt(a)} lijn ${n}`, (a, n) => `${tt(a)} ligne ${n}`);
P(/^Width column (\d+)$/, n => `Breedte kolom ${n}`, n => `Largeur colonne ${n}`);
P(/^Height row (\d+)$/, n => `Hoogte rij ${n}`, n => `Hauteur ligne ${n}`);
P(/^Price (\d+) by (\d+)$/, (a, b) => `Prijs ${a} op ${b}`, (a, b) => `Prix ${a} sur ${b}`);
P(/^(.+) quantity$/, a => `Aantal ${tt(a).toLowerCase()}`, a => `Quantité ${tt(a).toLowerCase()}`);
P(/^(.+) in millimetres$/, a => `${tt(a)} in millimeter`, a => `${tt(a)} en millimètres`);
P(/^(.+) lines$/, a => `${tt(a)}: lijnen`, a => `${tt(a)} : lignes`);

const F = (re, nl, fr) => { FRAG.nl.push([re, nl]); FRAG.fr.push([re, fr]); };
F(/\bhere\b/g, 'hier', 'ici'); F(/\/sash\b/g, '/vleugel', '/ouvrant'); F(/\/pc\b/g, '/st', '/pc'); F(/\/day\b/g, '/dag', '/jour');
F(/\bfollows days on site\b/g, 'volgt werfdagen', 'suit les jours de chantier'); F(/\bIncluded\b/g, 'Inbegrepen', 'Inclus'); F(/\bmin\./g, 'min.', 'min.');
F(/\bper unit\b/g, 'per stuk', 'par pièce');
})();
