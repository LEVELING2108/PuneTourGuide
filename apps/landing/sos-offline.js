// Offline emergency page of the bridge (sw.js): texts the contacts the old app saved on this phone
// (localStorage "pe_sos_contacts"), with a GPS pin when the phone has a fix. GPS needs no data.
(function () {
  var link = document.getElementById('text');
  var where = document.getElementById('where');
  var contacts = [];
  try {
    contacts = JSON.parse(localStorage.getItem('pe_sos_contacts') || '[]');
  } catch (e) {}
  var phones = contacts
    .map(function (c) { return String((c && c.phone) || '').replace(/[^\d+]/g, ''); })
    .filter(Boolean);
  if (!phones.length) return;

  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Same wording as the app's SOS text
  function setText(at) {
    var body = ['SOS: I need help now.', at ? 'Map: https://maps.google.com/?q=' + at.lat.toFixed(5) + ',' + at.lng.toFixed(5) : 'I could not get my location.', 'Call me, or 112.'].join(' ');
    var text = encodeURIComponent(body);
    link.href = ios && phones.length > 1 ? 'sms://open?addresses=' + phones.join(',') + '&body=' + text : 'sms:' + phones.join(',') + '?&body=' + text;
  }
  setText(null);
  link.textContent = phones.length === 1 ? 'Text my emergency contact' : 'Text my ' + phones.length + ' emergency contacts';
  link.hidden = false;

  if (!navigator.geolocation) return;
  where.hidden = false;
  where.textContent = 'Finding your location for the text…';
  navigator.geolocation.getCurrentPosition(
    function (p) {
      setText({ lat: p.coords.latitude, lng: p.coords.longitude });
      where.textContent = 'Your location is in the text.';
    },
    function () {
      where.textContent = 'Location not found. The text goes without it.';
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
  );
})();
