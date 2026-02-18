import React from 'react';
import '../styles/admin.css';

export default function InstellingenPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Instellingen</h1>
        <p className="admin-page-subtitle">Systeeminstellingen en integraties</p>
      </div>

      <div style={{ maxWidth: 720 }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Integraties</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Resend (e-mail)</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Automatische e-mails na intake en follow-ups</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px' }}>
                  Geconfigureerd
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Supabase</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Database, auth en opslag</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px' }}>
                  Actief
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
