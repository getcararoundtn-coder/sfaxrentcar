import React from 'react';
import CookieConsent from 'react-cookie-consent';

const CookieConsentBanner = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Tout accepter"
      declineButtonText="Refuser tout"
      enableDeclineButton
      flipButtons
      cookieName="cookieConsent"
      sameSite="lax"
      debug={true}
      style={{
        background: '#2d3748',
        fontSize: '14px',
        textAlign: 'center',
        padding: '15px',
        zIndex: 9999,
      }}
      buttonStyle={{
        background: '#6b46c0',
        color: 'white',
        borderRadius: '30px',
        padding: '8px 24px',
        margin: '0 10px',
        border: 'none',
        cursor: 'pointer',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#cbd5e0',
        borderRadius: '30px',
        padding: '8px 24px',
        margin: '0 10px',
        border: '1px solid #4a5568',
        cursor: 'pointer',
      }}
      expires={365}
      onAccept={() => console.log('✅ Cookies acceptés')}
      onDecline={() => console.log('❌ Cookies refusés')}
    >
      <span>🍪 Nous utilisons des cookies pour améliorer votre expérience.</span>
    </CookieConsent>
  );
};

export default CookieConsentBanner;