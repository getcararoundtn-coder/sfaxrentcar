import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AuthContext } from '../context/AuthContext';
import CarWizard from '../components/CarWizard';
import API from '../services/api';
import './RentYourCar.css';

// ========== قائمة الماركات العالمية الشاملة (مع خيار Autre) ==========
const carBrands = [
  'Abarth', 'Acura', 'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Buick',
  'BYD', 'Cadillac', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia', 'Daewoo', 'Daihatsu',
  'Datsun', 'Dodge', 'DS Automobiles', 'Ferrari', 'Fiat', 'Fisker', 'Ford', 'Geely', 'Genesis', 'GMC',
  'Great Wall', 'Haval', 'Honda', 'Hongqi', 'Hyundai', 'Infiniti', 'Isuzu', 'Iveco', 'JAC', 'Jaguar',
  'Jeep', 'Kia', 'Koenigsegg', 'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Ligier', 'Lincoln',
  'Lotus', 'Lucid Motors', 'Lynk & Co', 'Mahindra', 'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz',
  'MG', 'Mini', 'Mitsubishi', 'Mobilize', 'Morgan', 'Nio', 'Nissan', 'NSU', 'Oldsmobile', 'Opel', 'Pagani',
  'Peugeot', 'Polestar', 'Pontiac', 'Porsche', 'Proton', 'Ram', 'Renault', 'Rimac', 'Rolls-Royce', 'Rover',
  'Saab', 'Saturn', 'Scania', 'Seat', 'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'Tata', 'Tesla',
  'Toyota', 'Triumph', 'Vauxhall', 'Volkswagen', 'Volvo', 'Wuling', 'Xpeng', 'Zeekr', 'Zotye', 'Autre'
];

// ========== الموديلات حسب الماركة (شاملة) ==========
const carModels = {
  'Ford': ['EcoSport', 'Fiesta', 'Focus', 'Mondeo', 'Fusion', 'Mustang', 'Mustang Mach-E', 'Explorer', 'Expedition', 'Edge', 'Escape', 'Kuga', 'Puma', 'Ranger', 'F-150', 'F-250', 'Transit', 'Tourneo', 'Galaxy', 'S-Max', 'C-Max', 'B-Max', 'Ka', 'Figo', 'GT', 'Bronco', 'Bronco Sport', 'Maverick'],
  'Renault': ['Clio', 'Captur', 'Megane', 'Megane E-Tech', 'Scenic', 'Espace', 'Kadjar', 'Austral', 'Arkana', 'Talisman', 'Zoe', 'Twingo', 'Twingo E-Tech', 'Kangoo', 'Master', 'Trafic', 'Alaskan', 'Kwid', 'Symbioz', 'Rafale', 'R5', 'R4'],
  'Peugeot': ['208', '2008', '308', '3008', '408', '508', '5008', '508 SW', 'Rifter', 'Partner', 'Expert', 'Boxer', 'Traveller', 'Landtrek', '108', '107', '1007', 'RCZ', 'iOn', 'e-208', 'e-2008', 'e-308', 'e-3008', 'e-5008'],
  'Citroën': ['C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C4 X', 'C5 Aircross', 'C5 X', 'Berlingo', 'Jumpy', 'SpaceTourer', 'Ami', 'DS3', 'DS4', 'DS5', 'DS7', 'DS9', 'e-C3', 'e-C4', 'e-C4 X'],
  'Toyota': ['Yaris', 'Yaris Cross', 'Corolla', 'Corolla Cross', 'Camry', 'RAV4', 'C-HR', 'Highlander', 'Land Cruiser', 'Land Cruiser Prado', 'Fortuner', 'Hilux', 'Supra', 'GR86', 'GR Yaris', 'GR Corolla', 'Prius', 'Mirai', 'bZ4X', 'Aygo', 'Aygo X', 'Proace', 'Proace City'],
  'Volkswagen': ['Polo', 'Golf', 'Golf GTI', 'Golf R', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID.Buzz', 'Passat', 'Arteon', 'Tiguan', 'Tiguan Allspace', 'T-Roc', 'Taigo', 'T-Cross', 'Touareg', 'Touran', 'Sharan', 'California', 'Caddy', 'Transporter', 'Amarok', 'Up!', 'e-Up!'],
  'BMW': ['Série 1', 'Série 2', 'Série 2 Gran Coupé', 'Série 3', 'Série 4', 'Série 5', 'Série 6', 'Série 7', 'Série 8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'i3', 'i4', 'i5', 'i7', 'iX', 'iX1', 'iX2', 'iX3', 'Z4', 'M2', 'M3', 'M4', 'M5', 'M8'],
  'Mercedes-Benz': ['Classe A', 'Classe B', 'Classe C', 'Classe CLA', 'Classe CLS', 'Classe E', 'Classe S', 'Classe GLA', 'Classe GLB', 'Classe GLC', 'Classe GLE', 'Classe GLS', 'Classe G', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'EQV', 'AMG GT', 'AMG SL', 'Vito', 'Sprinter', 'Citan', 'T-Class'],
  'Audi': ['A1', 'A3', 'A3 Sportback', 'A4', 'A4 Avant', 'A5', 'A5 Sportback', 'A6', 'A6 Avant', 'A7', 'A8', 'Q2', 'Q3', 'Q3 Sportback', 'Q4 e-tron', 'Q5', 'Q5 Sportback', 'Q6 e-tron', 'Q7', 'Q8', 'Q8 e-tron', 'e-tron GT', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS Q3', 'RS e-tron GT'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
  'Hyundai': ['i10', 'i20', 'i30', 'i40', 'Tucson', 'Santa Fe', 'Kona', 'Kona Electric', 'Bayon', 'IONIQ', 'IONIQ 5', 'IONIQ 6', 'IONIQ 7', 'Nexo', 'Genesis', 'Veloster', 'Elantra', 'Sonata', 'Palisade', 'Staria'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Ceed SW', 'ProCeed', 'XCeed', 'Sportage', 'Sorento', 'Stonic', 'Niro', 'Niro EV', 'Soul', 'Soul EV', 'EV6', 'EV9', 'Telluride', 'Carnival', 'Mohave', 'K5', 'K8'],
  'Nissan': ['Micra', 'Note', 'Leaf', 'Juke', 'Qashqai', 'X-Trail', 'Pathfinder', 'Navara', 'Patrol', 'GT-R', '370Z', 'Z', 'Ariya', 'Townstar', 'Primastar', 'Interstar'],
  'Dacia': ['Sandero', 'Sandero Stepway', 'Logan', 'Logan MCV', 'Duster', 'Jogger', 'Spring', 'Lodgy', 'Dokker'],
  'Opel': ['Corsa', 'Corsa-e', 'Astra', 'Astra-e', 'Mokka', 'Mokka-e', 'Grandland', 'Grandland-e', 'Crossland', 'Insignia', 'Zafira', 'Combo', 'Vivaro', 'Movano'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Alhambra', 'Mii', 'Mii Electric'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Enyaq Coupe', 'Scala', 'Rapid', 'Citigo'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'CX-90', 'MX-5', 'MX-30'],
  'Volvo': ['XC40', 'XC40 Recharge', 'XC60', 'XC60 Recharge', 'XC90', 'XC90 Recharge', 'S60', 'S90', 'V60', 'V90', 'C40 Recharge', 'EX30', 'EX90', 'EM90'],
  'Honda': ['Jazz', 'Civic', 'Accord', 'CR-V', 'HR-V', 'ZR-V', 'e:Ny1', 'Pilot', 'Ridgeline', 'NSX', 'S660', 'e'],
  'Suzuki': ['Swift', 'Ignis', 'Vitara', 'S-Cross', 'Jimny', 'Across', 'Swace', 'Wagon R', 'Celerio'],
  'Mitsubishi': ['Space Star', 'Colt', 'ASX', 'Eclipse Cross', 'Outlander', 'L200', 'Pajero', 'Pajero Sport'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Avenger'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery', 'Discovery Sport', 'Defender', 'Freelander'],
  'Jaguar': ['F-Type', 'F-Pace', 'E-Pace', 'I-Pace', 'XE', 'XF', 'XJ'],
  'Porsche': ['911', '718 Cayman', '718 Boxster', 'Panamera', 'Cayenne', 'Macan', 'Taycan', 'Taycan Cross Turismo'],
  'Fiat': ['500', '500e', '500X', '500L', 'Panda', 'Tipo', 'Doblo', 'Ducato', 'Scudo', 'Ulysse', '600e'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', 'Junior', '4C', '8C'],
  'DS Automobiles': ['DS3', 'DS3 Crossback', 'DS4', 'DS7 Crossback', 'DS9'],
  'Mini': ['Cooper', 'Cooper S', 'Cooper SE', 'Countryman', 'Clubman', 'Paceman', 'Coupe', 'Roadster'],
  'BYD': ['Atto 3', 'Dolphin', 'Seal', 'Han', 'Tang', 'Seagull', 'Song Plus', 'Yuan Plus'],
  'MG': ['ZS', 'ZS EV', 'HS', 'HS PHEV', 'MG4', 'MG5', 'Marvel R', 'Cyberster', 'MG3', 'MG6'],
  'Chery': ['Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Tiggo 8 Pro', 'Arrizo 5', 'Arrizo 8', 'Omoda 5', 'Jaecoo 7'],
  'Geely': ['Coolray', 'Azkarra', 'Emgrand', 'Geometry C', 'Monjaro', 'Tugella'],
  'Lynk & Co': ['01', '02', '03', '05', '06', '09'],
  'SsangYong': ['Tivoli', 'Korando', 'Rexton', 'Musso', 'Rodius', 'XLV'],
  'Smart': ['Fortwo', 'Forfour', 'EQ Fortwo', 'EQ Forfour', '#1', '#3'],
  'Lexus': ['UX', 'NX', 'RX', 'RZ', 'TX', 'GX', 'LX', 'ES', 'IS', 'LC', 'LS', 'RC'],
  'Acura': ['MDX', 'RDX', 'TLX', 'ILX', 'NSX', 'ZDX', 'Integra'],
  'Infiniti': ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  'Genesis': ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'Grecale', 'MC20', 'GranTurismo', 'GranCabrio'],
  'Ferrari': ['F8 Tributo', 'SF90 Stradale', '296 GTB', 'Purosangue', 'Roma', 'Portofino', '812 Superfast', 'LaFerrari'],
  'Lamborghini': ['Huracán', 'Aventador', 'Urus', 'Revuelto', 'Sián', 'Countach'],
  'Aston Martin': ['DB11', 'DB12', 'DBX', 'Vantage', 'DBS', 'Valhalla', 'Valkyrie'],
  'Bentley': ['Bentayga', 'Continental GT', 'Flying Spur', 'Mulsanne'],
  'Rolls-Royce': ['Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Spectre'],
  'Bugatti': ['Chiron', 'Veyron', 'Divo', 'Centodieci', 'Mistral'],
  'McLaren': ['720S', '750S', '765LT', 'Artura', 'GT', 'Senna', 'Speedtail', 'Elva'],
  'Koenigsegg': ['Jesko', 'Regera', 'Gemera', 'Agera', 'CC850'],
  'Pagani': ['Huayra', 'Zonda', 'Utopia'],
  'Rimac': ['Nevera', 'Concept One'],
  'Lotus': ['Emira', 'Evija', 'Eletre', 'Emeya', 'Exige', 'Evora'],
  'GMC': ['Sierra', 'Yukon', 'Terrain', 'Acadia', 'Canyon', 'Hummer EV'],
  'Cadillac': ['Escalade', 'XT4', 'XT5', 'XT6', 'CT4', 'CT5', 'Lyriq', 'Celestiq'],
  'Chevrolet': ['Spark', 'Aveo', 'Cruze', 'Malibu', 'Camaro', 'Corvette', 'Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Silverado', 'Colorado'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Hornet', 'Grand Caravan'],
  'Chrysler': ['300', 'Pacifica', 'Voyager'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Lincoln': ['Navigator', 'Aviator', 'Nautilus', 'Corsair', 'Zephyr'],
  'Buick': ['Encore', 'Encore GX', 'Envision', 'Enclave', 'LaCrosse'],
  'Subaru': ['Impreza', 'WRX', 'Forester', 'Outback', 'Crosstrek', 'Ascent', 'Legacy', 'BRZ', 'Solterra'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Tigor', 'Punch', 'Nano'],
  'Autre': [] // Pour les marques personnalisées
};

// ========== قائمة المعتمديات الكاملة ==========
const delegationsList = [
  // Ariana
  'Ariana Ville', 'Ettadhamen', 'Kalâat el-Andalous', 'La Soukra', 'Mnihla', 'Raoued', 'Sidi Thabet',
  // Béja
  'Amdoun', 'Béja Nord', 'Béja Sud', 'Goubellat', 'Medjez el-Bab', 'Nefza', 'Téboursouk', 'Testour', 'Thibar',
  // Ben Arous
  'Ben Arous', 'Bou Mhel el-Bassatine', 'Ezzahra', 'Fouchana', 'Hammam Chott', 'Hammam Lif', 'Mégrine', 'Mohamedia', 'Mornag', 'Radès', 'El Mourouj',
  // Bizerte
  'Bizerte Nord', 'Bizerte Sud', 'El Alia', 'Ghezala', 'Joumine', 'Mateur', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Sejnane', 'Tinja', 'Utique', 'Zarzouna', 'Ghar El Melh',
  // Gabès
  'Gabès Médina', 'Gabès Ouest', 'Gabès Sud', 'El Hamma', 'El Hamma Ouest', 'Mareth-Dkhila', 'Menzel El Habib', 'Matmata', 'Métouia', 'Nouvelle Matmata', 'Oudhref', 'Toujane', 'Ghannouch',
  // Gafsa
  'Belkhir', 'El Guettar', 'El Ksar', 'Gafsa Nord', 'Gafsa Sud', 'Mdhilla', 'Métlaoui', 'Moularès', 'Redeyef', 'Sened', 'Sidi Aïch', 'Sidi Boubaker', 'Zannouch',
  // Jendouba
  'Aïn Draham', 'Balta-Bou Aouane', 'Bou Salem', 'Fernana', 'Ghardimaou', 'Jendouba', 'Jendouba Nord', 'Oued Meliz', 'Tabarka',
  // Kairouan
  'Aïn Djeloula', 'Bou Hajla', 'Chebika', 'Echrarda', 'El Alâa', 'Haffouz', 'Hajeb El Ayoun', 'Kairouan Nord', 'Kairouan Sud', 'Menzel Mehiri', 'Nasrallah', 'Oueslatia', 'Sbikha',
  // Kasserine
  'El Ayoun', 'Ezzouhour', 'Fériana', 'Foussana', 'Haïdra', 'Hassi El Ferid', 'Jedelienne', 'Kasserine Nord', 'Kasserine Sud', 'Majel Bel Abbès', 'Sbeïtla', 'Sbiba', 'Thala',
  // Kébili
  'Douz Nord', 'Douz Sud', 'Faouar', 'Kébili Nord', 'Kébili Sud', 'Rjim Maatoug', 'Souk Lahad',
  // Le Kef
  'Dahmani', 'El Ksour', 'Jérissa', 'Kalâat Khasba', 'Kalaat Senan', 'Kef Est', 'Kef Ouest', 'Nebeur', 'Sakiet Sidi Youssef', 'Sers', 'Tajerouine', 'Touiref',
  // Mahdia
  'Bou Merdes', 'Chebba', 'Chorbane', 'El Bradâa', 'El Jem', 'Essouassi', 'Hebira', 'Ksour Essef', 'Mahdia', 'Melloulèche', 'Ouled Chamekh', 'Rejiche', 'Sidi Alouane',
  // Manouba
  'Borj El Amri', 'Djedeida', 'Douar Hicher', 'El Batan', 'La Manouba', 'Mornaguia', 'Oued Ellil', 'Tebourba',
  // Médenine
  'Ben Gardane', 'Beni Khedache', 'Djerba - Ajim', 'Djerba - Houmt Souk', 'Djerba - Midoun', 'Médenine Nord', 'Médenine Sud', 'Sidi Makhlouf', 'Zarzis',
  // Monastir
  'Bekalta', 'Bembla', 'Beni Hassen', 'Jemmal', 'Ksar Hellal', 'Ksibet el-Médiouni', 'Moknine', 'Monastir', 'Ouerdanine', 'Sahline', 'Sayada-Lamta-Bou Hajar', 'Téboulba', 'Zéramdine',
  // Nabeul
  'Béni Khalled', 'Béni Khiar', 'Bou Argoub', 'Dar Chaâbane El Fehri', 'El Haouaria', 'El Mida', 'Grombalia', 'Hammam Ghezèze', 'Kélibia', 'Korba', 'Menzel Bouzelfa', 'Menzel Temime', 'Nabeul', 'Soliman', 'Takelsa',
  // Sfax
  'Agareb', 'Bir Ali Ben Khalifa', 'El Amra', 'El Hencha', 'Graïba', 'Jebiniana', 'Kerkennah', 'Mahrès', 'Menzel Chaker', 'Sakiet Eddaïer', 'Sakiet Ezzit', 'Sfax Sud', 'Sfax Ouest', 'Sfax Ville', 'Skhira', 'Thyna',
  // Sidi Bouzid
  'Bir El Hafey', 'Cebbala Ouled Asker', 'Essaïda', 'Hichria', 'Jilma', 'Meknassy', 'Menzel Bouzaiane', 'Mezzouna', 'Ouled Haffouz', 'Regueb', 'Sidi Ali Ben Aoun', 'Sidi Bouzid Est', 'Sidi Bouzid Ouest', 'Souk Jedid',
  // Siliana
  'Bargou', 'Bou Arada', 'El Aroussa', 'El Krib', 'Gaâfour', 'Kesra', 'Makthar', 'Rouhia', 'Sidi Bou Rouis', 'Siliana Nord', 'Siliana Sud',
  // Sousse
  'Akouda', 'Bouficha', 'Enfida', 'Hammam Sousse', 'Hergla', 'Kalâa Kebira', 'Kalâa Seghira', 'Kondar', "M'saken", 'Sidi Bou Ali', 'Sidi El Hani', 'Sousse Jawhara', 'Sousse Médina', 'Sousse Riadh', 'Sousse Sidi Abdelhamid', 'Zaouiet Ksibet Thrayet',
  // Tataouine
  'Beni Mhira', 'Bir Lahmar', 'Dehiba', 'Ghomrassen', 'Remada', 'Smâr', 'Tataouine Nord', 'Tataouine Sud',
  // Tozeur
  'Degache', 'El Hamma du Jérid', 'Hazoua', 'Nefta', 'Tameghza', 'Tozeur',
  // Tunis
  'Bab El Bhar', 'Bab Souika', 'Carthage', 'Cité El Khadra', 'Djebel Jelloud', 'El Kabaria', 'El Menzah', 'El Omrane', 'El Omrane supérieur', 'El Ouardia', 'Ettahrir', 'Ezzouhour', 'Hraïria', 'La Goulette', 'La Marsa', 'Le Bardo', 'Le Kram', 'Médina', 'Séjoumi', 'Sidi El Béchir', 'Sidi Hassine',
  // Zaghouan
  'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf', 'Zaghouan', 'Zriba'
];

// ========== الولايات التونسية (مع خيار Autre) ==========
const tunisianCities = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan', 'Autre'
];

const RentYourCar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [isCustomDelegation, setIsCustomDelegation] = useState(false);
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customDelegation, setCustomDelegation] = useState('');
  const [initialData, setInitialData] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    location: '',
    delegation: '',
    deliveryMethod: ''
  });
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableDelegations, setAvailableDelegations] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // تحديث الموديلات عند تغيير الماركة
  useEffect(() => {
    if (initialData.brand && initialData.brand !== 'Autre') {
      setAvailableModels(carModels[initialData.brand] || []);
      setInitialData(prev => ({ ...prev, model: '' }));
    } else if (initialData.brand === 'Autre') {
      setAvailableModels([]);
    } else {
      setAvailableModels([]);
    }
  }, [initialData.brand]);

  // تحديث المعتمديات عند تغيير الولاية
  useEffect(() => {
    if (initialData.location && initialData.location !== 'Autre') {
      setAvailableDelegations(delegationsList);
      setInitialData(prev => ({ ...prev, delegation: '' }));
    } else if (initialData.location === 'Autre') {
      setAvailableDelegations([]);
    } else {
      setAvailableDelegations([]);
    }
  }, [initialData.location]);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    
    const finalBrand = initialData.brand === 'Autre' ? customBrand : initialData.brand;
    const finalModel = initialData.model === 'Autre' ? customModel : initialData.model;
    const finalCity = initialData.location === 'Autre' ? customCity : initialData.location;
    const finalDelegation = initialData.delegation === 'Autre' ? customDelegation : initialData.delegation;
    
    if (!finalBrand || !finalModel || !initialData.year || 
        !initialData.mileage || !finalCity || !finalDelegation) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    setLoading(true);
    try {
      await API.post('/cars/wizard/save', {
        step: 1,
        data: { 
          ...initialData, 
          brand: finalBrand,
          model: finalModel,
          location: finalCity,
          delegation: finalDelegation
        }
      });
      setShowWizard(true);
    } catch (err) {
      console.error('Error saving initial data:', err);
      alert('حدث خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInitialData({ ...initialData, [name]: value });
    
    // Gestion des champs "Autre"
    if (name === 'brand' && value === 'Autre') {
      setIsCustomBrand(true);
      setIsCustomModel(false);
      setIsCustomCity(false);
      setIsCustomDelegation(false);
    } else if (name === 'brand' && value !== 'Autre') {
      setIsCustomBrand(false);
      setCustomBrand('');
    }
    
    if (name === 'model' && value === 'Autre') {
      setIsCustomModel(true);
    } else if (name === 'model' && value !== 'Autre') {
      setIsCustomModel(false);
      setCustomModel('');
    }
    
    if (name === 'location' && value === 'Autre') {
      setIsCustomCity(true);
      setIsCustomDelegation(false);
    } else if (name === 'location' && value !== 'Autre') {
      setIsCustomCity(false);
      setCustomCity('');
    }
    
    if (name === 'delegation' && value === 'Autre') {
      setIsCustomDelegation(true);
    } else if (name === 'delegation' && value !== 'Autre') {
      setIsCustomDelegation(false);
      setCustomDelegation('');
    }
  };

  const handleCustomFieldChange = (field, value) => {
    if (field === 'brand') {
      setCustomBrand(value);
      setInitialData(prev => ({ ...prev, brand: value }));
    } else if (field === 'model') {
      setCustomModel(value);
      setInitialData(prev => ({ ...prev, model: value }));
    } else if (field === 'city') {
      setCustomCity(value);
      setInitialData(prev => ({ ...prev, location: value }));
    } else if (field === 'delegation') {
      setCustomDelegation(value);
      setInitialData(prev => ({ ...prev, delegation: value }));
    }
  };

  if (!user) {
    return null;
  }

  if (showWizard) {
    return <CarWizard initialData={initialData} />;
  }

  return (
    <>
      <Navbar />
      <div className="rent-car-page">
        {/* الصورة في الأعلى */}
        <div className="rent-car-top">
          <img 
            src="/images/car-rental.png" 
            alt="Rent your car"
            className="rent-car-image"
          />
        </div>
        
        {/* المحتوى */}
        <div className="rent-car-left">
          <h1 className="rent-car-title">اربح المال عند كراء سيارتك</h1>
          <p className="rent-car-subtitle">inscription votre voiture</p>

          <form onSubmit={handleInitialSubmit} className="rent-car-form">
            {/* Marque */}
            <div className="form-group">
              <label>Brand de voiture *</label>
              {isCustomBrand ? (
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => handleCustomFieldChange('brand', e.target.value)}
                  placeholder="Entrez la marque de votre voiture"
                  required
                />
              ) : (
                <select
                  name="brand"
                  value={initialData.brand}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une marque</option>
                  {carBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              )}
              <small className="form-hint">
                {!isCustomBrand ? 'Vous pouvez aussi sélectionner "Autre" pour saisir une marque personnalisée' : 'Entrez la marque exacte de votre véhicule'}
              </small>
            </div>

            {/* Modèle */}
            <div className="form-group">
              <label>Modèle *</label>
              {isCustomModel ? (
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => handleCustomFieldChange('model', e.target.value)}
                  placeholder="Entrez le modèle de votre voiture"
                  required
                />
              ) : (
                <select
                  name="model"
                  value={initialData.model}
                  onChange={handleChange}
                  required
                  disabled={!initialData.brand || initialData.brand === 'Autre'}
                >
                  <option value="">Sélectionner un modèle</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="Autre">Autre (saisir manuellement)</option>
                </select>
              )}
              {!initialData.brand && !isCustomModel && (
                <small className="form-hint">Veuillez d'abord sélectionner une marque</small>
              )}
              {(initialData.brand === 'Autre' || isCustomModel) && (
                <small className="form-hint">Entrez le modèle exact de votre véhicule</small>
              )}
            </div>

            {/* Année */}
            <div className="form-group">
              <label>Année de fabrication *</label>
              <select
                name="year"
                value={initialData.year}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une année</option>
                {[...Array(16)].map((_, i) => {
                  const year = 2015 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
              <small className="form-hint">Année de première mise en circulation (2015-2030)</small>
            </div>

            {/* Kilométrage */}
            <div className="form-group">
              <label>Kilométrage *</label>
              <select name="mileage" value={initialData.mileage} onChange={handleChange} required>
                <option value="">Sélectionner</option>
                <option value="0-15000">0-15000 km</option>
                <option value="15000-50000">15000-50000 km</option>
                <option value="50000-100000">50000-100000 km</option>
                <option value="100000-150000">100000-150000 km</option>
                <option value="150000-200000">150000-200000 km</option>
                <option value="200000+">200000+ km</option>
              </select>
              <small className="form-hint">Cette information aide les locataires à choisir une voiture fiable</small>
            </div>

            {/* Gouvernorat */}
            <div className="form-group">
              <label>Gouvernorat *</label>
              {isCustomCity ? (
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => handleCustomFieldChange('city', e.target.value)}
                  placeholder="Entrez le nom du gouvernorat"
                  required
                />
              ) : (
                <select
                  name="location"
                  value={initialData.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un gouvernorat</option>
                  {tunisianCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              )}
              <small className="form-hint">
                {!isCustomCity ? 'Vous pouvez aussi sélectionner "Autre" pour saisir un gouvernorat personnalisé' : 'Entrez le nom exact du gouvernorat'}
              </small>
            </div>

            {/* Délégation */}
            <div className="form-group">
              <label>Délégation *</label>
              {isCustomDelegation ? (
                <input
                  type="text"
                  value={customDelegation}
                  onChange={(e) => handleCustomFieldChange('delegation', e.target.value)}
                  placeholder="Entrez le nom de la délégation"
                  required
                />
              ) : (
                <select
                  name="delegation"
                  value={initialData.delegation}
                  onChange={handleChange}
                  required
                  disabled={!initialData.location || initialData.location === 'Autre'}
                >
                  <option value="">Sélectionner une délégation</option>
                  {availableDelegations.map(delegation => (
                    <option key={delegation} value={delegation}>{delegation}</option>
                  ))}
                  <option value="Autre">Autre (saisir manuellement)</option>
                </select>
              )}
              {!initialData.location && !isCustomCity && (
                <small className="form-hint">Veuillez d'abord sélectionner un gouvernorat</small>
              )}
              {(initialData.location === 'Autre' || isCustomDelegation) && (
                <small className="form-hint">Entrez le nom exact de la délégation</small>
              )}
            </div>

            <button type="submit" disabled={loading} className="start-button">
              {loading ? 'Chargement...' : 'ابدأ الآن'}
            </button>
          </form>

          <div className="delivery-options">
            <h3>طرق الكراء</h3>
            <div className="delivery-option">
              <span className="delivery-icon">🚚</span>
              <div>
                <strong>Vous livrez la voiture au locataire</strong>
                <p>Vous livrez la voiture à l'adresse du locataire</p>
              </div>
            </div>
            <div className="delivery-option">
              <span className="delivery-icon">🏠</span>
              <div>
                <strong>Le locataire vient récupérer la voiture</strong>
                <p>Le client vient récupérer la voiture à l'adresse indiquée</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>كيف تعمل المنصة؟</h3>
            <ul>
              <li>📝 أضف سيارتك في بضع خطوات</li>
              <li>✅ تأكيد الحجز من قبل المستأجر</li>
              <li>💰 استلم المال مباشرة بعد الحجز</li>
              <li>💸 دفع عمولة 5% فقط عند نجاح الحجز</li>
            </ul>
          </div>

          <div className="about-section">
            <a href="/about">à propos</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RentYourCar;