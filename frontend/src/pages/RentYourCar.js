import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AuthContext } from '../context/AuthContext';
import CarWizard from '../components/CarWizard';
import API from '../services/api';
import './RentYourCar.css';

// ========== قائمة الماركات العالمية الشاملة ==========
const carBrands = [
  'AC Cars', 'Acura', 'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Buick', 
  'BYD', 'Cadillac', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia', 'Daewoo', 'Daihatsu',
  'Datsun', 'Dodge', 'DS Automobiles', 'Ferrari', 'Fiat', 'Fisker', 'Ford', 'Geely', 'Genesis', 'GMC',
  'Great Wall', 'Haval', 'Honda', 'Hongqi', 'Hyundai', 'Infiniti', 'Isuzu', 'Iveco', 'JAC', 'Jaguar',
  'Jeep', 'Kia', 'Koenigsegg', 'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Ligier', 'Lincoln',
  'Lotus', 'Lucid Motors', 'Lynk & Co', 'Mahindra', 'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz',
  'MG', 'Mini', 'Mitsubishi', 'Mobilize', 'Morgan', 'Nio', 'Nissan', 'NSU', 'Oldsmobile', 'Opel', 'Pagani',
  'Peugeot', 'Polestar', 'Pontiac', 'Porsche', 'Proton', 'Ram', 'Renault', 'Rimac', 'Rolls-Royce', 'Rover',
  'Saab', 'Saturn', 'Scania', 'Seat', 'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'Tata', 'Tesla',
  'Toyota', 'Triumph', 'Vauxhall', 'Volkswagen', 'Volvo', 'Wuling', 'Xpeng', 'Zeekr', 'Zotye'
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
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Tigor', 'Punch', 'Nano']
};

// ========== الولايات التونسية ==========
const tunisianCities = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan'
];

// ========== المعتمديات حسب الولاية ==========
const delegationsByCity = {
  'Tunis': ['Tunis Médina', 'Bab El Bhar', 'Bab Souika', 'Carthage', 'La Goulette', 'La Marsa', 'Le Bardo', 'Le Kram', 'Sidi Bou Said', 'El Omrane', 'Ettahrir', 'Ezzouhour'],
  'Sfax': ['Sfax Médina', 'Sfax Ouest', 'Sfax Sud', 'Sakiet Ezzit', 'Sakiet Eddaïer', 'Bir Ali Ben Khalifa', 'El Amra', 'El Hencha', 'Ghraiba', 'Jebiniana', 'Mahrès', 'Menzel Chaker', 'Thyna', 'Agareb'],
  'Sousse': ['Sousse Médina', 'Sousse Jawhara', 'Sousse Riadh', 'Sousse Sidi Abdelhamid', 'Akouda', 'Bouficha', 'Enfidha', 'Hammam Sousse', 'Hergla', 'Kalâa Kebira', 'Kalâa Seghira', "M'saken"],
  'Monastir': ['Monastir', 'Bekalta', 'Bembla', 'Beni Hassen', 'Jemmal', 'Ksar Hellal', 'Ksibet El Mediouni', 'Moknine', 'Ouerdanine', 'Sahline', 'Sayada', 'Téboulba', 'Zéramdine'],
  'Nabeul': ['Nabeul', 'Béni Khalled', 'Béni Khiar', 'Bou Argoub', 'Dar Chaabane', 'El Haouaria', 'Grombalia', 'Hammam Ghezèze', 'Hammamet', 'Kélibia', 'Korba', 'Menzel Temime', 'Soliman', 'Takelsa'],
  'Bizerte': ['Bizerte Nord', 'Bizerte Sud', 'El Alia', 'Ghezala', 'Joumine', 'Mateur', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Sejnane', 'Tinja', 'Utique', 'Zarzouna'],
  'Ariana': ['Ariana Médina', 'Ettadhamen', 'Kalâat El Andalous', 'La Soukra', 'Mnihla', 'Raoued', 'Sidi Thabet'],
  'Ben Arous': ['Ben Arous', 'Bou Mhel El Bassatine', 'El Mourouj', 'Ezzahra', 'Fouchana', 'Hammam Chott', 'Hammam Lif', 'Mohamedia', 'Mégrine', 'Mornag', 'Rades'],
  'Manouba': ['Manouba', 'Borj El Amri', 'Djedeida', 'Douar Hicher', 'El Battan', 'Mornaguia', 'Oued Ellil', 'Tebourba'],
  'Gabès': ['Gabès Médina', 'Gabès Ouest', 'Gabès Sud', 'El Hamma', 'Mareth', 'Menzel Habib', 'Matmata', 'Metouia', 'Nouvelle Matmata', 'Ghannouch'],
  'Gafsa': ['Gafsa Nord', 'Gafsa Sud', 'Belkhir', 'El Guettar', 'El Ksar', 'Mdhilla', 'Métlaoui', 'Redeyef', 'Sened', 'Sidi Aïch'],
  'Kairouan': ['Kairouan Nord', 'Kairouan Sud', 'Bou Hajla', 'Chebika', 'El Ala', 'Haffouz', 'Hajeb El Ayoun', 'Menzel Mehiri', 'Nasrallah', 'Oueslatia', 'Sbikha'],
  'Kasserine': ['Kasserine Nord', 'Kasserine Sud', 'El Ayoun', 'Fériana', 'Foussana', 'Haïdra', 'Hassi El Ferid', 'Majel Bel Abbès', 'Sbeïtla', 'Sbiba', 'Thala', 'Zitouna'],
  'Sidi Bouzid': ['Sidi Bouzid Est', 'Sidi Bouzid Ouest', 'Bekalta', 'Ben Aoun', 'Jilma', 'Meknassy', 'Menzel Bouzaiane', 'Ouled Haffouz', 'Regueb', 'Souassi', 'Essaïda'],
  'Mahdia': ['Mahdia', 'Bou Merdes', 'Chebba', 'Chorbane', 'El Jem', 'Hebira', 'Ksour Essaf', 'Melloulèche', 'Ouled Chamekh', 'Souassi', 'Sidi Alouane', 'Zeramdine'],
  'Médenine': ['Médenine Nord', 'Médenine Sud', 'Ben Gardane', 'Beni Khedache', 'Djerba Ajim', 'Djerba Houmt Souk', 'Djerba Midoun', 'Sidi Makhlouf', 'Zarzis'],
  'Kébili': ['Kébili Nord', 'Kébili Sud', 'Douz Nord', 'Douz Sud', 'Faouar', 'Rjim Maatoug', 'Souk Lahad', 'Bechri'],
  'Tozeur': ['Tozeur', 'Degache', 'Hazoua', 'Nefta', 'Tameghza'],
  'Béja': ['Béja Nord', 'Béja Sud', 'Amdoun', 'Goubellat', 'Majaz El Bab', 'Nefza', 'Téboursouk', 'Testour', 'Thibar'],
  'Jendouba': ['Jendouba', 'Aïn Draham', 'Balta', 'Bou Salem', 'Fernana', 'Ghardimaou', 'Oued Meliz', 'Tabarka'],
  'Le Kef': ['Le Kef Est', 'Le Kef Ouest', 'Dahmani', 'Jérissa', 'Kalaa Khasba', 'Kalaat Senan', 'Nebeur', 'Sakiet Sidi Youssef', 'Sers', 'Tajerouine'],
  'Siliana': ['Siliana Nord', 'Siliana Sud', 'Bargou', 'Bou Arada', 'El Krib', 'Gaâfour', 'Kesra', 'Makthar', 'Rouhia', 'Sidi Bou Rouis'],
  'Zaghouan': ['Zaghouan', 'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf', 'Zriba']
};

const RentYourCar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
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
    if (initialData.brand) {
      setAvailableModels(carModels[initialData.brand] || []);
      setInitialData(prev => ({ ...prev, model: '' }));
    } else {
      setAvailableModels([]);
    }
  }, [initialData.brand]);

  // تحديث المعتمديات عند تغيير الولاية
  useEffect(() => {
    if (initialData.location) {
      setAvailableDelegations(delegationsByCity[initialData.location] || []);
      setInitialData(prev => ({ ...prev, delegation: '' }));
    } else {
      setAvailableDelegations([]);
    }
  }, [initialData.location]);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    
    if (!initialData.brand || !initialData.model || !initialData.year || 
        !initialData.mileage || !initialData.location || !initialData.delegation) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    setLoading(true);
    try {
      await API.post('/cars/wizard/save', {
        step: 1,
        data: initialData
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
    setInitialData({ ...initialData, [e.target.name]: e.target.value });
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
            <div className="form-group">
              <label>Brand de voiture *</label>
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
            </div>

            <div className="form-group">
              <label>Modèle *</label>
              <select
                name="model"
                value={initialData.model}
                onChange={handleChange}
                required
                disabled={!initialData.brand}
              >
                <option value="">Sélectionner un modèle</option>
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              {!initialData.brand && (
                <small className="form-hint">Veuillez d'abord sélectionner une marque</small>
              )}
            </div>

            <div className="form-group">
              <label>Année de fabrication *</label>
              <select
                name="year"
                value={initialData.year}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une année</option>
                {[...Array(30)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>

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
            </div>

            <div className="form-group">
              <label>Gouvernorat *</label>
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
            </div>

            <div className="form-group">
              <label>Délégation *</label>
              <select
                name="delegation"
                value={initialData.delegation}
                onChange={handleChange}
                required
                disabled={!initialData.location}
              >
                <option value="">Sélectionner une délégation</option>
                {availableDelegations.map(delegation => (
                  <option key={delegation} value={delegation}>{delegation}</option>
                ))}
              </select>
              {!initialData.location && (
                <small className="form-hint">Veuillez d'abord sélectionner un gouvernorat</small>
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
                <strong>توصيل السيارة للمستأجر</strong>
                <p>نقوم بتوصيل السيارة إلى عنوان المستأجر</p>
              </div>
            </div>
            <div className="delivery-option">
              <span className="delivery-icon">🏠</span>
              <div>
                <strong>المستأجر يأتي لاستلام السيارة</strong>
                <p>يتم الاستلام في المكان المتفق عليه</p>
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