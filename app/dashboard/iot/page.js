'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getIoTDevices, registerIoTDevice, getIoTDeviceData } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function IoTDevicesPage() {
  return (
    <ProtectedClientRoute>
      <IoTDevicesContent />
    </ProtectedClientRoute>
  );
}

function IoTDevicesContent() {
  const { t } = useLanguage();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    device_type: '',
    device_name: '',
    device_serial: '',
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceData(selectedDevice.id);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await getIoTDevices();
      setDevices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceData = async (deviceId) => {
    try {
      const data = await getIoTDeviceData(deviceId, { limit: 50 });
      setDeviceData(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await registerIoTDevice(formData);
      setShowModal(false);
      setFormData({ device_type: '', device_name: '', device_serial: '' });
      fetchDevices();
    } catch (err) {
      alert(err.message || 'Failed to register device');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">IoT Devices</h1>
          <motion.button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register Device
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.section className="lg:col-span-1 bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">My Devices</h2>
            <div className="space-y-3">
              {devices.length === 0 ? (
                <p className="text-luxury-ivory/60">No devices registered</p>
              ) : (
                devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`w-full text-left p-4 rounded border transition-colors ${
                      selectedDevice?.id === device.id
                        ? 'border-luxury-gold bg-luxury-gold/10'
                        : 'border-luxury-gold/10 bg-luxury-black/50 hover:bg-luxury-gold/5'
                    }`}
                  >
                    <p className="text-luxury-ivory font-medium">{device.device_name}</p>
                    <p className="text-luxury-ivory/60 text-sm capitalize">{device.device_type.replace('_', ' ')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`w-2 h-2 rounded-full ${device.is_connected ? 'bg-green-400' : 'bg-red-400'}`}
                      />
                      <span className="text-luxury-ivory/50 text-xs">
                        {device.is_connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.section>

          <motion.section className="lg:col-span-2 bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            {selectedDevice ? (
              <>
                <h2 className="text-xl font-serif text-luxury-gold mb-4">{selectedDevice.device_name} Data</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {deviceData.length === 0 ? (
                    <p className="text-luxury-ivory/60">No data recorded yet</p>
                  ) : (
                    deviceData.map((data) => (
                      <div key={data.id} className="p-3 bg-luxury-black/50 rounded border border-luxury-gold/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-luxury-ivory font-medium capitalize">{data.data_type.replace('_', ' ')}</p>
                            <p className="text-luxury-ivory/60 text-sm">
                              {JSON.stringify(data.data_value)}
                            </p>
                          </div>
                          <p className="text-luxury-ivory/50 text-xs">
                            {new Date(data.recorded_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-luxury-ivory/60">Select a device to view data</p>
              </div>
            )}
          </motion.section>
        </div>

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-charcoal border border-luxury-gold/30 p-8 rounded-lg max-w-md w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <h2 className="text-2xl font-serif text-luxury-ivory mb-6">Register IoT Device</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Device Type *</label>
                    <select
                      value={formData.device_type}
                      onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    >
                      <option value="">Select</option>
                      <option value="smart_mirror">Smart Mirror</option>
                      <option value="skin_scanner">Skin Scanner</option>
                      <option value="moisture_sensor">Moisture Sensor</option>
                      <option value="uv_monitor">UV Monitor</option>
                      <option value="smart_dispenser">Smart Dispenser</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Device Name *</label>
                    <input
                      type="text"
                      value={formData.device_name}
                      onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Device Serial *</label>
                    <input
                      type="text"
                      value={formData.device_serial}
                      onChange={(e) => setFormData({ ...formData, device_serial: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
                      whileHover={{ scale: saving ? 1 : 1.02 }}
                      whileTap={{ scale: saving ? 1 : 0.98 }}
                    >
                      {saving ? 'Registering...' : 'Register'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFormData({ device_type: '', device_name: '', device_serial: '' });
                      }}
                      className="px-6 py-3 border border-luxury-gold/50 text-luxury-ivory/80"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
