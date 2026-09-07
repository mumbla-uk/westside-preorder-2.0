import React, { useState, useEffect, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  RotateCcw, 
  ChevronUp, 
  Mail,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Send,
  Loader2,
  CheckCircle2,
  Edit3,
  PhoneCall
} from 'lucide-react';

// =========================================================
// FIREBASE SETUP
// =========================================================
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCvLAZrNIWb9kI0XxrgCcH_LgQb_gxTg08",
  authDomain: "westside-preorder.firebaseapp.com",
  projectId: "westside-preorder",
  storageBucket: "westside-preorder.firebasestorage.app",
  messagingSenderId: "82024251206",
  appId: "1:82024251206:web:ffcd473aa8c25d67482f47",
  measurementId: "G-P7MJNLTNXK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================================================
// FORMSPREE ENDPOINT FOR KITCHEN ALERTS
// =========================================================
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mjybbdpl';

// Setup custom fonts programmatically
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=UnifrakturCook:wght=700&family=Playfair+Display:ital,wght=0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght=300;400;500;600;700;800&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.textContent = `
    .font-old-english {
      font-family: 'New Old English', 'Old English Text MT', 'Old English Text', 'Cloister Black', 'CloisterBlack', 'UnifrakturCook', serif;
      letter-spacing: -0.04em;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
}

const MENU_DATA = {
  snacks: [
    { id: 's1', name: 'Nocellara Olives', price: 4.50, tag: 'VG GF', desc: '' },
    { id: 's2', name: 'Buffalo Cucumbers', price: 6.00, tag: 'V 1,3,6', desc: 'Ranch dressing, pangrattato, dill.' },
    { id: 's3', name: 'Balsamic Onions', price: 4.50, tag: 'V 1,3,6', desc: '' },
    { id: 's4', name: 'Garic Parmesan Focaccia', price: 6.50, tag: 'V 1,6', desc: 'Tear and share.' },
    { id: 's5', name: "'Tavern Style' Gildas", price: 5.00, tag: 'GF 2,4,8', desc: 'Stuffed olive, house pickle, anchovie.' },
    { id: 's6', name: 'Fried Potato Slices', price: 7.50, tag: 'V 1,3,6,14', desc: 'Truffle mayo, parmesan, chives.' },
  ],
  plates: [
    { id: 'p1', name: 'Mozzarella Sticks', price: 7.50, tag: 'V 1,3,6', desc: 'Vodka sauce, parmesan.' },
    { id: 'p2', name: 'Buffalo Chicken Tenders', price: 10.00, tag: '1,3,6,8,12', desc: 'Ranch dressing, pickles, hot honey, dill crumb.' },
    { id: 'p3', name: 'Autumn Salad', price: 7.95, tag: 'GF V 6,12', desc: 'Orzo, butternut squash, pickled red onion, tomato, buffalo mozzarella, rocket, sun dried tomato dressing.' },
    { id: 'p4', name: 'Lasagne Fritti', price: 12.50, tag: '1,3,6,12,14', desc: 'Sugo, parmesan, pesto.' },
    { id: 'p5', name: 'Antipasti (Italian Tacos)', price: 7.95, tag: 'GF 1,6,8,12', desc: 'Coppa, balsamic onions, cornichons, whipped burrata.' },
    { id: 'p6', name: 'Spice Boi Parm Parm', price: 13.50, tag: '1,6,8,14,12', desc: 'Sugo, mozzarella, pepperoni, guindilla chillies, hot honey, pepperoni ranch.' }
  ],
  pastas: [
    { id: 'pa1', name: 'Rigatoni Alla Vodka', price: 13.95, tag: 'V 1,3,6', desc: 'Creamy tomato & vodka sauce, chilli, whipped burrata, parmesan.' },
    { id: 'pa2', name: "Moray Mac N' Cheese", price: 14.95, tag: '1,3,4,6,14', desc: 'Smoked haddock, crispy leeks.' },
    { id: 'pa3', name: "Chicken Afredo", price: 14.95, tag: '1,3,6,8', desc: 'Fettucine, broccoli.' },
    { id: 'pa4', name: 'Cauliflower Cacio e Pepe', price: 12.95, tag: 'VG* 1,8,11,12', desc: 'Tagliatelle, caramelised cauliflower. *Add parmesan £1.50' }
  ],
  pizzas: [
    { id: 'pz1', name: 'Marinara', price: 14.00, tag: 'VG* 1', desc: 'San marzano sugo, confit garlic, oregano. *Add parmesan £1.50' },
    { id: 'pz2', name: 'Cheese', price: 15.00, tag: 'V 1,6', desc: 'San marzano sugo, buffalo mozzarella, parmesan, oregano.' },
    { id: 'pz3', name: 'Gabagool', price: 17.00, tag: '1,6', desc: 'San marzano sugo, provolone, parmesan, cappacola.' },
    { id: 'pz4', name: 'Sausage & Peppers', price: 18.00, tag: '1,6', desc: 'San marzano sugo, mozzarella, italian sausage, piquante peppers.' },
    { id: 'pz5', name: 'The Spice Boi', price: 17.00, tag: '1,6', desc: 'San marzano sugo, mozzarella, pepperoni, hot honey, guindilla chillies.' },
    { id: 'pz6', name: '5 cheeses', price: 17.00, tag: '1,6', desc: 'Ricotta, mozzarella, gorgonzola, provolone, parmesan, fig jam, chives.' },
    { id: 'pz7', name: 'Vodka Pie', price: 17.00, tag: 'V 1,6', desc: 'Creamy tomato vodka sauce, san marzano sugo, mozzarella, whipped burrata, pesto.' },
    { id: 'pz8', name: 'Rum Ham & Pineapple', price: 17.00, tag: '1,6,8,12', desc: 'San marzano sugo, mozzarella, rum ham, pineapple, scotch bonnet & pineapple hot sauce.' },
    { id: 'pz9', name: 'Spice Bag', price: 16.00, tag: 'VG 1,11,13', desc: 'Curry sauce, salt & chilli cauliflower, onions, peppers, chilli, coriander, spring onion, vegan yoghurt.' }
  ],
  dips: [
    { id: 'dp1', name: 'Garlic & Herb', price: 2.00, desc: '' },
    { id: 'dp2', name: 'Truffle Mayo', price: 2.00, desc: '' },
    { id: 'dp3', name: 'Honey Buffalo', price: 2.00, desc: '' },
    { id: 'dp4', name: 'Pepperoni Ranch', price: 2.00, desc: '' },
    { id: 'dp5', name: 'Chilli Jam', price: 2.00, desc: '' },
    { id: 'dp6', name: 'Hot Honey', price: 2.00, desc: '' },
    { id: 'dp7', name: 'Burrata Ball', price: 6.50, desc: '' }
  ]
};

const ALLERGEN_KEY = [
  "1 Cereals", "2 Crustaceans", "3 Eggs", "4 Fish", "5 Lupin", "6 Milk", "7 Molluscs", 
  "8 Mustard", "9 Peanuts", "10 Sesame", "11 Soybeans", "12 Sulphur Dioxide & Sulphites", 
  "13 Tree Nuts", "14 Celery"
];

const MONTHS_LIST = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const YEARS_LIST = ['2026', '2027', '2028'];

export default function App() {
  const [quantities, setQuantities] = useState({});
  const [customDietary, setCustomDietary] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Form Submission & Order Tracking States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [isCutoffLocked, setIsCutoffLocked] = useState(false);

  // Booking Info States
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingDay, setBookingDay] = useState(''); // "01"-"31"
  const [bookingMonth, setBookingMonth] = useState(''); // "01"-"12"
  const [bookingYear, setBookingYear] = useState('2026'); // "2026"
  const [bookingTime, setBookingTime] = useState(''); // "17:30", etc.

  // 1. CATCH URL QUERY PARAMETERS & LOAD FIREBASE ORDER IF ORDERID EXISTS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    const orderIdParam = params.get('orderId');

    if (orderIdParam) {
      // Existing Order Found: Fetch directly from Firebase Firestore
      setActiveOrderId(orderIdParam);
      setIsEditingExisting(true);

      async function fetchExistingOrder() {
        try {
          const docRef = doc(db, 'preorders', orderIdParam);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.name) setBookingName(data.name);
            if (data.email) setBookingEmail(data.email);
            if (data.day) setBookingDay(data.day);
            if (data.month) setBookingMonth(data.month);
            if (data.year) setBookingYear(data.year);
            if (data.time) setBookingTime(data.time);
            if (data.quantities) setQuantities(data.quantities);
            if (data.customDietary) setCustomDietary(data.customDietary);
            if (data.specialRequests) setSpecialRequests(data.specialRequests);

            // Cut-off check: 1 day before or day of booking
            if (data.day && data.month && data.year) {
              const bookingDate = new Date(
                parseInt(data.year),
                parseInt(data.month) - 1,
                parseInt(data.day),
                23, 59, 59
              );
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const diffInTime = bookingDate.getTime() - today.getTime();
              const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

              if (diffInDays <= 1) {
                setIsCutoffLocked(true);
              }
            }
          }
        } catch (err) {
          console.error("Error loading order from Firebase:", err);
        }
      }

      fetchExistingOrder();
    } else {
      // Standard Desktop Link Parsed Parameters
      const nameParam = params.get('name');
      const emailParam = params.get('email');
      const dayParam = params.get('day');
      const monthParam = params.get('month');
      const yearParam = params.get('year');
      const timeParam = params.get('time');

      if (nameParam) setBookingName(nameParam);
      if (emailParam) setBookingEmail(emailParam);
      if (dayParam) setBookingDay(dayParam.padStart(2, '0'));
      if (monthParam) setBookingMonth(monthParam.padStart(2, '0'));
      if (yearParam) setBookingYear(yearParam);
      if (timeParam) setBookingTime(timeParam);
    }
  }, []);

  // Clear validation warning when details are updated
  useEffect(() => {
    if (bookingName.trim() && bookingEmail.trim() && bookingMonth && bookingDay && bookingYear && bookingTime) {
      setValidationError('');
    }
  }, [bookingName, bookingEmail, bookingMonth, bookingDay, bookingYear, bookingTime]);

  const getOrdinalSuffix = (dayNum) => {
    const d = parseInt(dayNum);
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const dynamicDaysList = useMemo(() => {
    if (!bookingMonth || !bookingYear) return [];
    
    const yearNum = parseInt(bookingYear);
    const monthNum = parseInt(bookingMonth);
    const totalDays = new Date(yearNum, monthNum, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= totalDays; i++) {
      const dayStr = i.toString().padStart(2, '0');
      const dateObj = new Date(yearNum, monthNum - 1, i);
      const weekdayLabel = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
      const displayLabel = `${weekdayLabel} ${i}${getOrdinalSuffix(i)}`;
      
      days.push({ value: dayStr, label: displayLabel, weekdayIndex: dateObj.getDay() });
    }
    return days;
  }, [bookingMonth, bookingYear]);

  useEffect(() => {
    if (bookingDay && dynamicDaysList.length > 0) {
      const dayExists = dynamicDaysList.some(d => d.value === bookingDay);
      if (!dayExists) {
        setBookingDay('');
        setBookingTime('');
      }
    }
  }, [bookingMonth, bookingYear, dynamicDaysList, bookingDay]);

  const availableTimes = useMemo(() => {
    if (!bookingDay || !bookingMonth || !bookingYear) return [];
    
    const yearNum = parseInt(bookingYear);
    const monthNum = parseInt(bookingMonth);
    const dayNum = parseInt(bookingDay);
    const selectedDate = new Date(yearNum, monthNum - 1, dayNum);
    const dayOfWeek = selectedDate.getDay();

    const isMonToThu = dayOfWeek >= 1 && dayOfWeek <= 4;
    const startHour = isMonToThu ? 17 : 12;
    const endHour = 20;
    const endMinute = 30;

    const slots = [];
    let h = startHour;
    let m = 0;

    while (h < endHour || (h === endHour && m <= endMinute)) {
      const hStr = h.toString().padStart(2, '0');
      const mStr = m.toString().padStart(2, '0');
      
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const displayStr = `${displayHour}:${mStr} ${period}`;

      slots.push({ value: `${hStr}:${mStr}`, label: displayStr });
      
      m += 15;
      if (m >= 60) {
        m = 0;
        h += 1;
      }
    }
    return slots;
  }, [bookingDay, bookingMonth, bookingYear]);

  useEffect(() => {
    if (bookingTime && availableTimes.length > 0) {
      const timeExists = availableTimes.some(t => t.value === bookingTime);
      if (!timeExists) {
        setBookingTime('');
      }
    }
  }, [availableTimes, bookingTime]);

  const totalItems = Object.entries(quantities)
    .filter(([id]) => !id.endsWith('_parm'))
    .reduce((sum, [_, q]) => sum + q, 0);
  
  const findItemPriceAndName = (id) => {
    for (const category in MENU_DATA) {
      const item = MENU_DATA[category].find(i => i.id === id);
      if (item) return item;
    }
    return { name: '', price: 0 };
  };

  const totalBill = Object.entries(quantities).reduce((sum, [id, qty]) => {
    if (id.endsWith('_parm')) {
      return sum + (1.50 * qty);
    }
    const { price } = findItemPriceAndName(id);
    return sum + (price * qty);
  }, 0);

  const serviceCharge = totalBill * 0.10;
  const grandTotal = totalBill + serviceCharge;

  const adjustQuantity = (id, amount) => {
    if (isCutoffLocked) return;
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + amount);
      const copy = { ...prev };
      
      if (next === 0) {
        delete copy[id];
        delete copy[`${id}_parm`]; 
      } else {
        copy[id] = next;
        const parmKey = `${id}_parm`;
        if (copy[parmKey] > next) {
          copy[parmKey] = next;
        }
      }
      return copy;
    });
  };

  const adjustParmesan = (itemId, amount, maxQty) => {
    if (isCutoffLocked) return;
    setQuantities(prev => {
      const parmKey = `${itemId}_parm`;
      const current = prev[parmKey] || 0;
      const next = Math.max(0, Math.min(maxQty, current + amount));
      
      const copy = { ...prev };
      if (next === 0) {
        delete copy[parmKey];
      } else {
        copy[parmKey] = next;
      }
      return copy;
    });
  };

  const clearSelection = () => {
    if (isCutoffLocked) return;
    setQuantities({});
    setCustomDietary('');
    setSpecialRequests('');
    setBookingName('');
    setBookingEmail('');
    setBookingDay('');
    setBookingMonth('');
    setBookingYear('2026');
    setBookingTime('');
    setValidationError('');
    setIsSubmittedSuccess(false);
    setActiveOrderId(null);
    setIsEditingExisting(false);
    setIsCutoffLocked(false);
  };

  const generateEmailText = () => {
    let orderLines = '[PRE-ORDER SELECTIONS]\n';
    let hasItems = false;

    Object.entries(MENU_DATA).forEach(([catKey, items]) => {
      const catOrdered = items.filter(item => quantities[item.id] > 0);
      if (catOrdered.length > 0) {
        hasItems = true;
        orderLines += `\n* ${catKey.toUpperCase()} *\n`;
        catOrdered.forEach(item => {
          const qty = quantities[item.id];
          orderLines += `  ${qty}x  ${item.name}\n`;
          
          const parmQty = quantities[`${item.id}_parm`] || 0;
          if (parmQty > 0) {
            orderLines += `      + ${parmQty}x Add Parmesan\n`;
          }
        });
      }
    });

    if (!hasItems) {
      orderLines += '\n(No items selected)';
    }

    if (customDietary.trim()) {
      orderLines += `\n\n[DIETARY & ALLERGY REQUESTS]\n  ${customDietary.trim()}\n`;
    }

    if (specialRequests.trim()) {
      orderLines += `\n\n[SPECIAL REQUESTS]\n  ${specialRequests.trim()}\n`;
    }

    return orderLines.trim();
  };

  const formatShortDate = () => {
    if (!bookingDay || !bookingMonth || !bookingYear) return 'TBD';
    const dayPadded = bookingDay.padStart(2, '0');
    const monthPadded = bookingMonth.padStart(2, '0');
    const yearShort = bookingYear.slice(-2);
    return `${dayPadded}/${monthPadded}/${yearShort}`;
  };

  const handleCopy = () => {
    const text = generateEmailText();
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textarea);
  };

  // 2. UNIFIED SUBMISSION HANDLER (FIREBASE + FORMSPREE + RESEND)
  const handleSubmitOrder = async () => {
    if (isEditingExisting && isCutoffLocked) {
      setValidationError('Online pre-order updates close 1 day prior to your booking. Please call us directly on 0141 286 6617.');
      return;
    }

    const nameStr = bookingName.trim();
    const emailStr = bookingEmail.trim();
    const dateStr = formatShortDate();
    const timeStr = bookingTime;

    if (!nameStr || !emailStr || !bookingMonth || !bookingDay || !bookingYear || !timeStr) {
      setValidationError('Please complete all booking details (including contact email) before submitting.');
      return;
    }

    if (totalItems === 0) {
      setValidationError('Please select at least one item for your pre-order.');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    // Reuse active UUID on edit, or generate a fresh UUID for new orders
    const targetOrderId = activeOrderId || crypto.randomUUID();
    const editUrl = `${window.location.origin}${window.location.pathname}?orderId=${targetOrderId}`;

    const orderPayload = {
      orderId: targetOrderId,
      name: nameStr,
      email: emailStr,
      day: bookingDay,
      month: bookingMonth,
      year: bookingYear,
      time: timeStr,
      formattedDate: dateStr,
      quantities: quantities,
      customDietary: customDietary.trim(),
      specialRequests: specialRequests.trim(),
      totalItems: totalItems,
      grandTotal: grandTotal,
      updatedAt: new Date().toISOString()
    };

    try {
      // Step A: Save or Update in Firebase Firestore
      const docRef = doc(db, 'preorders', targetOrderId);
      await setDoc(docRef, orderPayload, { merge: true });

      // Step B: Send Notification Email to Kitchen via Formspree
      const kitchenSubject = `${isEditingExisting ? 'UPDATED' : 'NEW'} Pre Order ${dateStr} ${timeStr} (${nameStr})`;

      const formspreePayload = {
        _subject: kitchenSubject,
        email: emailStr,
        order_reference: targetOrderId,
        edit_link: editUrl,
        booking_name: nameStr,
        booking_date: dateStr,
        booking_time: timeStr,
        total_items: totalItems,
        subtotal: `£${totalBill.toFixed(2)}`,
        grand_total: `£${grandTotal.toFixed(2)}`,
        order_details: generateEmailText(),
        dietary_requests: customDietary.trim() || 'None',
        special_requests: specialRequests.trim() || 'None'
      };

      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formspreePayload)
      });

      // Step C: Send Branded Email via Serverless API Proxy
      const customerSubject = isEditingExisting 
        ? `Pre-Order UPDATED: West Side Tavern (${dateStr} at ${timeStr})`
        : `Pre-Order Confirmation: West Side Tavern (${dateStr} at ${timeStr})`;

      const customerHtml = `
        <div style="font-family: Georgia, serif; background-color: #FAF6E8; color: #b32025; padding: 30px; border: 4px double #b32025; max-width: 600px; margin: 0 auto;">
          <h1 style="font-size: 26px; text-align: center; margin-bottom: 4px;">WEST SIDE TAVERN</h1>
          <p style="text-align: center; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">
            ${isEditingExisting ? 'Pre-Order Updated' : 'Pre-Order Receipt'}
          </p>
          <hr style="border: none; border-top: 1px dashed #b32025; margin: 20px 0;" />

          <p style="font-size: 15px;">Hi <strong>${nameStr}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.5;">
            Thank you! Your food pre-order for <strong>${dateStr} at ${timeStr}</strong> has been ${isEditingExisting ? 'updated and saved' : 'received'}.
          </p>

          <div style="border: 2px dashed #b32025; padding: 15px; background-color: rgba(179,32,37,0.05); text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; font-family: sans-serif; text-transform: uppercase;">
              Need to Make Changes Later?
            </p>
            <p style="margin: 0 0 14px 0; font-size: 12px; color: #444; font-family: sans-serif;">
              You can view or amend your dish choices anytime before your booking:
            </p>
            <a href="${editUrl}" style="background-color: #b32025; color: #FAF6E8; padding: 10px 18px; text-decoration: none; font-weight: bold; font-size: 12px; font-family: sans-serif; border-radius: 4px; display: inline-block;">
              View / Edit Pre-Order
            </a>
          </div>

          <h3 style="font-size: 15px; border-bottom: 1px solid #b32025; padding-bottom: 4px;">Order Selections</h3>
          <pre style="font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; line-height: 1.5; color: #222; background: #fff; padding: 12px; border: 1px solid #b32025;">${generateEmailText()}</pre>

          <div style="margin-top: 16px; font-size: 14px; font-weight: bold; text-align: right;">
            Grand Total (inc. 10% service charge): £${grandTotal.toFixed(2)}
          </div>

          <hr style="border: none; border-top: 1px dashed #b32025; margin: 20px 0;" />
          <p style="font-size: 11px; font-style: italic; text-align: center;">
            Payments taken at table at end of your booking or can be paid over the phone on 0141 286 6617.
          </p>
        </div>
      `;

      // Fetch our backend serverless function (no CORS error, key stays private)
      await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailStr,
          customerSubject,
          customerHtml
        })
      });

      // Update React state to show success screen
      setActiveOrderId(targetOrderId);
      setIsSubmittedSuccess(true);
    } catch (error) {
      console.error('Submission Error:', error);
      setValidationError('Network error. Please check your connection or contact the venue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItemName = (name) => {
    const openIndex = name.indexOf('(');
    const closeIndex = name.indexOf(')');
    if (openIndex !== -1 && closeIndex !== -1) {
      const coreName = name.slice(0, openIndex);
      const bracketText = name.slice(openIndex, closeIndex + 1);
      return (
        <span>
          {coreName}
          <span className="font-normal font-sans text-sm opacity-90">{bracketText}</span>
        </span>
      );
    }
    return name;
  };

  return (
    <div className="min-h-screen bg-[#FAF6E8] text-[#b32025] font-serif selection:bg-[#b32025] selection:text-[#FAF6E8] pb-32">
      
      {/* HEADER SECTION */}
      <header className="max-w-4xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center border-b border-dashed border-[#b32025]/30">
        <div className="text-xs tracking-wider uppercase font-sans font-bold flex items-center gap-2">
          <span>West Side Tavern Pre-Order Menu</span>
          {isEditingExisting && (
            <span className="bg-[#b32025] text-[#FAF6E8] text-[10px] px-2 py-0.5 rounded font-mono font-normal flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Editing Order
            </span>
          )}
        </div>
        {(totalItems > 0 || customDietary || bookingName || bookingEmail || bookingDay) && !isCutoffLocked && (
          <button 
            onClick={clearSelection}
            className="flex items-center gap-1.5 text-xs uppercase font-sans font-bold hover:opacity-80 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Menu Selection
          </button>
        )}
      </header>

      {/* DETAILED SECTIONS */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-12">
        
        {/* CUT-OFF BANNER FOR LATE EDITS */}
        {isEditingExisting && isCutoffLocked && (
          <section className="border-4 border-double border-[#b32025] p-6 rounded-lg bg-[#b32025]/10 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm font-sans">
              <AlertCircle className="w-5 h-5 text-[#b32025]" />
              <span>Online Pre-Order Edits Closed</span>
            </div>
            <p className="text-sm italic max-w-lg mx-auto leading-relaxed">
              Online amendments are locked within 24 hours of your booking date. To make any changes or additions to your order for today or tomorrow, please phone the venue directly:
            </p>
            <a 
              href="tel:01412866617" 
              className="inline-flex items-center gap-2 bg-[#b32025] text-[#FAF6E8] font-sans font-bold text-xs uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition shadow-md"
            >
              <PhoneCall className="w-4 h-4" /> Call Venue on 0141 286 6617
            </a>
          </section>
        )}

        {/* SNACKS SECTION */}
        <section className="border-4 border-double border-[#b32025] p-6 rounded-lg relative">
          <img 
            src="https://i.postimg.cc/3JWPPyYG/snacks.png" 
            alt="Snacks" 
            className="block md:hidden h-12 mx-auto mb-6 object-contain" 
          />
          <h2 className="hidden md:block font-old-english text-5xl text-center tracking-widest mb-6">Snacks</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {MENU_DATA.snacks.map(item => {
              const qty = quantities[item.id] || 0;
              return (
                <div key={item.id} className="flex flex-col group">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-2 flex-1">
                      <span className="font-bold text-lg hover:underline cursor-pointer" onClick={() => adjustQuantity(item.id, 1)}>
                        {renderItemName(item.name)}
                      </span>
                      <span className="font-bold text-base">£{item.price.toFixed(2)}</span>
                      {item.tag && <span className="text-[10px] uppercase font-sans font-extrabold opacity-80">{item.tag}</span>}
                    </div>
                    
                    <div className="inline-flex items-center gap-2 font-sans text-xs flex-shrink-0">
                      <button 
                        onClick={() => adjustQuantity(item.id, -1)} 
                        className={`w-5 h-5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${qty === 0 || isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                        disabled={qty === 0 || isCutoffLocked}
                      >
                        -
                      </button>
                      <span className={`w-3 text-center font-bold ${qty > 0 ? 'underline' : 'opacity-40'}`}>{qty}</span>
                      <button 
                        onClick={() => adjustQuantity(item.id, 1)} 
                        className={`w-5 h-5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                        disabled={isCutoffLocked}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {item.desc && <p className="text-sm italic opacity-90 mt-0.5 leading-snug">{item.desc}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* PLATES SECTION */}
        <section className="space-y-6">
          <div className="flex items-center md:items-baseline gap-3 border-b border-dashed border-[#b32025]/30 pb-2">
            <img 
              src="https://i.postimg.cc/NfLWWyBm/plates.png" 
              alt="Plates" 
              className="block md:hidden h-10 object-contain" 
            />
            <h2 className="hidden md:block font-old-english text-4xl tracking-wider">Plates</h2>
            <span className="italic text-base opacity-90">For the table.</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {MENU_DATA.plates.map(item => {
              const qty = quantities[item.id] || 0;
              return (
                <div key={item.id} className="flex flex-col">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-2 flex-1">
                      <span className="font-bold text-lg hover:underline cursor-pointer" onClick={() => adjustQuantity(item.id, 1)}>
                        {renderItemName(item.name)}
                      </span>
                      <span className="font-bold text-base">£{item.price.toFixed(2)}</span>
                      {item.tag && <span className="text-[10px] uppercase font-sans font-extrabold opacity-80">{item.tag}</span>}
                    </div>
                    
                    <div className="inline-flex items-center gap-2 font-sans text-xs flex-shrink-0">
                      <button 
                        onClick={() => adjustQuantity(item.id, -1)} 
                        className={`w-5 h-5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${qty === 0 || isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                        disabled={qty === 0 || isCutoffLocked}
                      >
                        -
                      </button>
                      <span className={`w-3 text-center font-bold ${qty > 0 ? 'underline' : 'opacity-40'}`}>{qty}</span>
                      <button 
                        onClick={() => adjustQuantity(item.id, 1)} 
                        className={`w-5 h-5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                        disabled={isCutoffLocked}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {item.desc && <p className="text-sm italic opacity-90 mt-0.5 leading-snug">{item.desc}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <div className="border-t border-dotted border-[#b32025] my-6"></div>

        {/* PASTAS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center md:items-baseline gap-3 border-b border-dashed border-[#b32025]/30 pb-2">
            <img 
              src="https://i.postimg.cc/QxVRRBhB/pastas.png" 
              alt="Pastas" 
              className="block md:hidden h-10 object-contain" 
            />
            <h2 className="hidden md:block font-old-english text-4xl tracking-wider">Pastas</h2>
            <span className="italic text-base opacity-90">Fresh made.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {MENU_DATA.pastas.map(item => {
              const qty = quantities[item.id] || 0;
              const parmQty = quantities[`${item.id}_parm`] || 0;
              return (
                <div key={item.id} className="flex flex-col">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-2 flex-1">
                      <span className="font-bold text-lg hover:underline cursor-pointer" onClick={() => adjustQuantity(item.id, 1)}>
                        {renderItemName(item.name)}
                      </span>
                      <span className="font-bold text-base">£{item.price.toFixed(2)}</span>
                      {item.tag && <span className="text-[10px] uppercase font-sans font-extrabold opacity-80">{item.tag}</span>}
                    </div>
                    
                    <div className="inline-flex items-center gap-2 font-sans text-xs flex-shrink-0">
                      <button 
                        onClick={() => adjustQuantity(item.id, -1)} 
                        className={`w-5 h-5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${qty === 0 || isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                        disabled={qty === 0 || isCutoffLocked}
                      >
                        -
                      </button>
                      <span className={`w-3 text-center font-bold ${qty > 0 ? 'underline' : 'opacity-40'}`}>{qty}</span>
                      <button 
                        onClick={() => adjustQuantity(item.id, 1)} 
                        className={`w-5 h-5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                        disabled={isCutoffLocked}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {item.desc && <p className="text-sm italic opacity-90 mt-0.5 leading-snug">{item.desc}</p>}
                  
                  {item.id === 'pa4' && qty > 0 && (
                    <div className="mt-2.5 pl-4 border-l-2 border-[#b32025]/30 flex items-center justify-between text-xs bg-[#b32025]/5 p-1.5 rounded">
                      <span className="font-sans font-semibold tracking-wide uppercase text-[10px]">Add Parmesan (+£1.50)</span>
                      <div className="inline-flex items-center gap-2 font-sans">
                        <button 
                          onClick={() => adjustParmesan(item.id, -1, qty)} 
                          className={`w-4.5 h-4.5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${parmQty === 0 || isCutoffLocked ? 'opacity-35 cursor-not-allowed' : ''}`}
                          disabled={parmQty === 0 || isCutoffLocked}
                        >
                          -
                        </button>
                        <span className="w-3 text-center font-bold">{parmQty}</span>
                        <button 
                          onClick={() => adjustParmesan(item.id, 1, qty)} 
                          className={`w-4.5 h-4.5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${parmQty >= qty || isCutoffLocked ? 'opacity-35 cursor-not-allowed' : ''}`}
                          disabled={parmQty >= qty || isCutoffLocked}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="border-t border-dotted border-[#b32025] my-6"></div>

        {/* PIZZAS & DIPS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <section className="md:col-span-8 space-y-6">
            <div className="flex items-center md:items-baseline gap-3 border-b border-dashed border-[#b32025]/30 pb-2">
              <img 
                src="https://i.postimg.cc/9Fzvv4C7/pizzas.png" 
                alt="Pizzas" 
                className="block md:hidden h-10 object-contain" 
              />
              <h2 className="hidden md:block font-old-english text-4xl tracking-wider">Pizzas</h2>
              <span className="italic text-base opacity-90">14" cut 'tavern style' for sharing.</span>
            </div>

            <div className="space-y-6">
              {MENU_DATA.pizzas.map(item => {
                const qty = quantities[item.id] || 0;
                const parmQty = quantities[`${item.id}_parm`] || 0;
                return (
                  <div key={item.id} className="flex flex-col">
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="flex flex-wrap items-baseline gap-x-2 flex-1">
                        <span className="font-bold text-lg hover:underline cursor-pointer" onClick={() => adjustQuantity(item.id, 1)}>
                          {renderItemName(item.name)}
                        </span>
                        <span className="font-bold text-base">£{item.price.toFixed(2)}</span>
                        {item.tag && <span className="text-[10px] uppercase font-sans font-extrabold opacity-80">{item.tag}</span>}
                      </div>
                      
                      <div className="inline-flex items-center gap-2 font-sans text-xs flex-shrink-0">
                        <button 
                          onClick={() => adjustQuantity(item.id, -1)} 
                          className={`w-5 h-5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${qty === 0 || isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                          disabled={qty === 0 || isCutoffLocked}
                        >
                          -
                        </button>
                        <span className={`w-3 text-center font-bold ${qty > 0 ? 'underline' : 'opacity-40'}`}>{qty}</span>
                        <button 
                          onClick={() => adjustQuantity(item.id, 1)} 
                          className={`w-5 h-5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                          disabled={isCutoffLocked}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {item.desc && <p className="text-sm italic opacity-90 mt-0.5 leading-snug">{item.desc}</p>}

                    {item.id === 'pz1' && qty > 0 && (
                      <div className="mt-2.5 pl-4 border-l-2 border-[#b32025]/30 flex items-center justify-between text-xs bg-[#b32025]/5 p-1.5 rounded">
                        <span className="font-sans font-semibold tracking-wide uppercase text-[10px]">Add Parmesan (+£1.50)</span>
                        <div className="inline-flex items-center gap-2 font-sans">
                          <button 
                            onClick={() => adjustParmesan(item.id, -1, qty)} 
                            className={`w-4.5 h-4.5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${parmQty === 0 || isCutoffLocked ? 'opacity-35 cursor-not-allowed' : ''}`}
                            disabled={parmQty === 0 || isCutoffLocked}
                          >
                            -
                          </button>
                          <span className="w-3 text-center font-bold">{parmQty}</span>
                          <button 
                            onClick={() => adjustParmesan(item.id, 1, qty)} 
                            className={`w-4.5 h-4.5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${parmQty >= qty || isCutoffLocked ? 'opacity-35 cursor-not-allowed' : ''}`}
                            disabled={parmQty >= qty || isCutoffLocked}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* DIPS SECTION */}
          <section className="md:col-span-4 flex flex-col items-center">
            <div className="border-2 border-[#b32025] rounded-[50px] p-8 w-full max-w-[280px] text-center flex flex-col items-center select-none">
              <img 
                src="https://i.postimg.cc/JzyNj8mJ/dips.png" 
                alt="Dips" 
                className="block md:hidden h-10 object-contain mb-4" 
              />
              <h2 className="hidden md:block font-old-english text-4xl tracking-widest mb-4">Dips</h2>
              
              <div className="w-full space-y-4">
                {MENU_DATA.dips.map(item => {
                  const qty = quantities[item.id] || 0;
                  return (
                    <div key={item.id} className="flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-base">
                        <span className="hover:underline cursor-pointer" onClick={() => adjustQuantity(item.id, 1)}>
                          {renderItemName(item.name)}
                        </span>
                        <span>£{item.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 font-sans text-[11px] mt-1">
                        <button 
                          onClick={() => adjustQuantity(item.id, -1)} 
                          className={`w-4.5 h-4.5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${qty === 0 || isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                          disabled={qty === 0 || isCutoffLocked}
                        >
                          -
                        </button>
                        <span className={`w-3 text-center font-bold ${qty > 0 ? 'underline' : 'opacity-40'}`}>{qty}</span>
                        <button 
                          onClick={() => adjustQuantity(item.id, 1)} 
                          className={`w-4.5 h-4.5 rounded-full border border-[#b32025] flex items-center justify-center font-bold hover:bg-[#b32025] hover:text-[#FAF6E8] transition ${isCutoffLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                          disabled={isCutoffLocked}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#b32025] w-full mt-6 pt-4">
                <span className="font-sans font-extrabold text-[11px] uppercase tracking-wider block"></span>
                <span className="text-xs italic block mt-1 opacity-90"></span>
              </div>
            </div>
          </section>

        </div>

        {/* HOW TO PAY NOTICE BOARD */}
        <section className="border-2 border-dashed border-[#b32025] p-5 rounded bg-[#b32025]/5 text-center mt-12">
          <p className="font-sans font-bold uppercase tracking-wider text-xs mb-1">✦ How To Pay ✦</p>
          <p className="text-sm italic leading-relaxed">
            Payments taken at table at end of your booking or can be paid over the phone on <strong className="font-sans font-bold">0141 286 6617</strong>
          </p>
        </section>

        {/* ALLERGEN GLOSSARY */}
        <section className="border-2 border-[#b32025] p-4 rounded text-center text-xs space-y-2 mt-4">
          <p className="font-bold uppercase tracking-wider text-[11px]">Allergens Key Warning Reference</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 opacity-90 italic">
            {ALLERGEN_KEY.map((allergen, idx) => (
              <span key={idx}>{allergen}</span>
            ))}
          </div>
        </section>

      </main>

      {/* BOTTOM ACTION TRAY */}
      {(totalItems > 0 || customDietary || bookingName || bookingEmail || bookingDay) && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#b32025] text-[#FAF6E8] border-t-2 border-[#FAF6E8]/20 shadow-2xl z-40">
          <div 
            onClick={() => setIsReviewOpen(true)}
            className="max-w-4xl mx-auto px-6 py-4 cursor-pointer select-none font-sans"
          >
            <div className="hidden md:grid grid-cols-3 items-center w-full">
              <div className="text-left">
                <span className="font-serif text-sm md:text-lg font-bold tracking-wide">
                  Selected Pre-Order: {totalItems} Items
                </span>
              </div>
              <div className="flex justify-center">
                <span className="text-xs bg-[#FAF6E8] text-[#b32025] px-2.5 py-1 rounded font-extrabold text-sm shadow-md leading-none">
                  £{totalBill.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold uppercase tracking-widest text-right">
                <span>Review your order</span>
                <ChevronUp className="w-4 h-4" />
              </div>
            </div>

            <div className="flex md:hidden justify-between items-center w-full text-xs">
              <div className="text-left font-serif font-bold text-sm">
                {totalItems} Items - £{totalBill.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <span>Review your order</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW / RECEIPT MODAL FRAME */}
      {isReviewOpen && (
        <div className="fixed inset-0 bg-[#FAF6E8] z-50 overflow-y-auto p-6 md:p-12 border-8 border-double border-[#b32025] m-3 rounded-2xl flex flex-col justify-between text-[#b32025]">
          
          {isSubmittedSuccess ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="max-w-xl mx-auto my-auto text-center space-y-6 py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto text-[#b32025] animate-bounce" />
              <h2 className="font-old-english text-5xl">Pre-Order {isEditingExisting ? 'Updated!' : 'Received!'}</h2>
              <p className="font-sans text-base leading-relaxed">
                Thank you, <strong>{bookingName}</strong>. Your pre-order for <strong>{formatShortDate()} at {bookingTime}</strong> has been saved directly to West Side Tavern.
              </p>
              
              {/* EDIT LINK DISPLAY FOR CUSTOMER */}
              <div className="border-2 border-dashed border-[#b32025] p-4 rounded bg-[#b32025]/5 text-xs font-sans space-y-3">
                <p><strong>Order Reference:</strong> <code className="font-mono bg-[#b32025]/10 px-2 py-0.5 rounded text-sm">{activeOrderId}</code></p>
                <p>If you need to edit or make changes to your choices later, bookmark or copy your unique link:</p>
                <div className="flex items-center justify-center gap-2 bg-[#FAF6E8] border border-[#b32025] p-2 rounded">
                  <input 
                    readOnly 
                    value={`${window.location.origin}${window.location.pathname}?orderId=${activeOrderId}`}
                    className="w-full bg-transparent text-[11px] font-mono select-all focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?orderId=${activeOrderId}`);
                      alert("Edit link copied to clipboard!");
                    }}
                    className="bg-[#b32025] text-[#FAF6E8] text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider whitespace-nowrap hover:opacity-90"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsReviewOpen(false);
                  setIsSubmittedSuccess(false);
                }}
                className="py-3 px-8 rounded bg-[#b32025] text-[#FAF6E8] font-sans font-bold uppercase tracking-widest text-xs hover:opacity-90 transition"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            /* REGULAR FORM REVIEW STATE */
            <div className="max-w-2xl mx-auto w-full space-y-8 pb-12">
              
              <div className="text-center border-b-2 border-dashed border-[#b32025] pb-6">
                <img 
                  src="https://i.postimg.cc/RZ37wm97/order-summary.png" 
                  alt="Order Summary" 
                  className="block md:hidden h-10 mx-auto mb-2 object-contain" 
                />
                <h1 className="hidden md:block font-old-english text-5xl mb-2">Pre-Order Receipt</h1>
                <p className="text-xs tracking-widest uppercase font-sans font-bold">Summary Review</p>
              </div>

              {/* Booking Logistics Fields */}
              <div className="space-y-4 border-b border-[#b32025]/30 pb-6">
                <img 
                  src="https://i.postimg.cc/W3jqYFFZ/bookingdetails.png" 
                  alt="Booking Details" 
                  className="block md:hidden h-10 mx-auto mb-4 object-contain" 
                />
                <h3 className="hidden md:block font-old-english text-3xl">Booking Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
                  
                  {/* Name Field */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Name on booking
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sarah Jenkins"
                      value={bookingName}
                      disabled={isCutoffLocked}
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full bg-transparent border-2 border-[#b32025] rounded p-2 text-sm text-[#b32025] placeholder-[#b32025]/40 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Contact Email
                    </label>
                    <input 
                      type="email" 
                      placeholder="e.g. sarah@example.com"
                      value={bookingEmail}
                      disabled={isCutoffLocked}
                      onChange={(e) => setBookingEmail(e.target.value)}
                      className="w-full bg-transparent border-2 border-[#b32025] rounded p-2 text-sm text-[#b32025] placeholder-[#b32025]/40 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Date of booking
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      
                      <select
                        value={bookingMonth}
                        disabled={isCutoffLocked}
                        onChange={(e) => setBookingMonth(e.target.value)}
                        className="bg-[#FAF6E8] border-2 border-[#b32025] rounded p-2 text-xs text-[#b32025] focus:outline-none disabled:opacity-50"
                      >
                        <option value="">Month</option>
                        {MONTHS_LIST.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>

                      <select
                        value={bookingDay}
                        onChange={(e) => setBookingDay(e.target.value)}
                        disabled={!bookingMonth || isCutoffLocked}
                        className="bg-[#FAF6E8] border-2 border-[#b32025] rounded p-2 text-xs text-[#b32025] focus:outline-none disabled:opacity-50"
                      >
                        <option value="">Day</option>
                        {dynamicDaysList.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>

                      <select
                        value={bookingYear}
                        disabled={isCutoffLocked}
                        onChange={(e) => setBookingYear(e.target.value)}
                        className="bg-[#FAF6E8] border-2 border-[#b32025] rounded p-2 text-xs text-[#b32025] focus:outline-none disabled:opacity-50"
                      >
                        {YEARS_LIST.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>

                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Time of booking
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      disabled={!bookingDay || isCutoffLocked}
                      className="w-full bg-[#FAF6E8] border-2 border-[#b32025] rounded p-2 text-sm text-[#b32025] focus:outline-none disabled:opacity-50"
                    >
                      <option value="">{bookingDay ? 'Select Time Slot' : 'Please complete your booking date first'}</option>
                      {availableTimes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              {/* Selected Items List Summary */}
              <div className="space-y-4">
                <img 
                  src="https://i.postimg.cc/76DJtGG0/selecteditems.png" 
                  alt="Selected Items" 
                  className="block md:hidden h-10 mx-auto mb-4 object-contain" 
                />
                <h3 className="hidden md:block font-old-english text-3xl border-b border-[#b32025]/30 pb-2">Selected Items</h3>
                
                <div className="space-y-4 font-serif">
                  {Object.entries(MENU_DATA).some(([_, items]) => items.some(i => quantities[i.id] > 0)) ? (
                    Object.entries(MENU_DATA).map(([catKey, items]) => {
                      const catOrdered = items.filter(item => quantities[item.id] > 0);
                      if (catOrdered.length === 0) return null;
                      return (
                        <div key={catKey} className="space-y-1">
                          <h4 className="font-bold uppercase tracking-wider text-xs border-b border-dotted border-[#b32025]/30 pb-0.5 mt-3">{catKey}</h4>
                          {catOrdered.map(item => {
                            const qty = quantities[item.id];
                            const parmQty = quantities[`${item.id}_parm`] || 0;
                            return (
                              <div key={item.id} className="text-base">
                                <div className="flex justify-between font-bold">
                                  <span>{qty}x {item.name}</span>
                                </div>
                                {parmQty > 0 && (
                                  <div className="text-sm pl-6 italic opacity-85 text-[#b32025]/80">
                                    + {parmQty}x Add Parmesan
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  ) : (
                    <p className="italic opacity-80 py-4">No menu items selected. Go back to add dishes to your pre-order.</p>
                  )}
                </div>
              </div>

              {/* Dietary & Special Requests */}
              <div className="border-t border-[#b32025]/30 pt-6 space-y-4 font-serif">
                <div className="space-y-1.5">
                  <h4 className="font-bold uppercase tracking-wider text-xs">Dietary & Allergy Requests</h4>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Peanut allergy, gluten free etc."
                    value={customDietary}
                    disabled={isCutoffLocked}
                    onChange={(e) => setCustomDietary(e.target.value)}
                    className="w-full bg-[#FAF6E8] border-2 border-[#b32025] rounded p-3 text-sm text-[#b32025] placeholder-[#b32025]/40 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold uppercase tracking-wider text-xs">Special Requests</h4>
                  <textarea 
                    rows={2}
                    placeholder="e.g. no hot honey, extra parmesan, sauce on side etc."
                    value={specialRequests}
                    disabled={isCutoffLocked}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-[#FAF6E8] border-2 border-[#b32025] rounded p-3 text-sm text-[#b32025] placeholder-[#b32025]/40 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Total summary breakdown */}
              <div className="border-t-4 border-double border-[#b32025] pt-4 space-y-2">
                <div className="flex justify-between items-baseline text-sm font-serif opacity-80">
                  <span>Subtotal:</span>
                  <span>£{totalBill.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs font-serif opacity-85 italic">
                  <span>Service Charge (10%):</span>
                  <span>£{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="border-t border-dashed border-[#b32025]/30 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-xs font-sans">TOTAL:</span>
                    <span className="block text-[10px] text-[#b32025]/75 italic leading-tight mt-1 normal-case max-w-xs md:max-w-md">
                      *please note a discretionary 10% service charge is placed on all food orders
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold">£{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center text-xs opacity-80 italic">
                Payments taken at table at end of your booking or can be paid over the phone on 0141 286 6617
              </div>

            </div>
          )}

          {/* Validation Error Message Box */}
          {validationError && !isSubmittedSuccess && (
            <div className="max-w-2xl mx-auto w-full mb-4 bg-[#b32025]/10 border border-[#b32025] rounded p-3 flex items-center justify-center gap-2 text-sm font-sans font-bold text-[#b32025]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Actions panel */}
          {!isSubmittedSuccess && (
            <div className="max-w-2xl mx-auto w-full pt-6 border-t border-[#b32025]/20 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* SUBMIT / UPDATE BUTTON */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || isCutoffLocked}
                  className="w-full py-4 rounded font-bold text-sm tracking-widest uppercase transition-all duration-150 flex items-center justify-center gap-2 border-2 border-[#b32025] bg-[#b32025] text-[#FAF6E8] hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {isEditingExisting ? 'Update Pre-Order' : 'Submit Pre-Order'}
                    </>
                  )}
                </button>

                {/* COPY SELECTIONS BUTTON */}
                <button
                  onClick={handleCopy}
                  className={`w-full py-4 rounded font-bold text-sm tracking-widest uppercase transition-all duration-150 flex items-center justify-center gap-2 border-2 border-[#b32025] ${
                    copied 
                      ? 'bg-[#b32025] text-[#FAF6E8] border-[#b32025]' 
                      : 'bg-transparent text-[#b32025] hover:bg-[#b32025] hover:text-[#FAF6E8] active:scale-[0.98]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Selections Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Selections
                    </>
                  )}
                </button>

              </div>

              <button
                onClick={() => setIsReviewOpen(false)}
                className="w-full text-center text-xs uppercase font-extrabold tracking-widest mt-6 hover:underline"
              >
                ← Close & Return to Menu
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}