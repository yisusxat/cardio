import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Calendar } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import BookingWizard from '../../components/appointments/BookingWizard';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, getDayName, getInitials } from '../../lib/utils';
import api from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';

interface Doctor {
  id: string;
  specialty: string;
  bio?: string | null;
  basePrice: number;
  isActive: boolean;
  user: { id: string; firstName: string; lastName: string; email: string };
  schedules: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  services: { id: string; name: string; description?: string | null; price: number; isActive: boolean }[];
}

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/doctors/${id}`)
      .then((r) => setDoctor(r.data.data))
      .catch(() => navigate('/doctors'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-32">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      </PageLayout>
    );
  }

  if (!doctor) return null;

  const name = `${doctor.user.firstName} ${doctor.user.lastName}`;
  const initials = getInitials(doctor.user.firstName, doctor.user.lastName);
  const activeServices = doctor.services.filter((s) => s.isActive);

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }
    setBookingOpen(true);
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Doctor profile card */}
            <div className="card p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <h1 className="mt-4 text-xl font-bold text-gray-900">Dr(a). {name}</h1>
              <Badge variant="primary" className="mt-2">{doctor.specialty}</Badge>

              {doctor.bio && (
                <p className="mt-4 text-sm leading-relaxed text-gray-500 text-left">{doctor.bio}</p>
              )}

              <div className="mt-5 flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-primary-500" /> Consulta desde
                </div>
                <span className="font-bold text-primary-700">{formatPrice(Number(doctor.basePrice))}</span>
              </div>

              {isPatient && (
                <Button className="mt-4 w-full" onClick={handleBook}>
                  <Calendar className="h-4 w-4" /> Agendar Cita
                </Button>
              )}
              {!isAuthenticated && (
                <Button className="mt-4 w-full" onClick={handleBook}>
                  <Calendar className="h-4 w-4" /> Agendar Cita
                </Button>
              )}
            </div>

            {/* Schedule */}
            <div className="card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock className="h-4 w-4 text-primary-500" /> Horarios de Atención
              </h2>
              {doctor.schedules.length === 0 ? (
                <p className="text-sm text-gray-400">Sin horarios disponibles</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {doctor.schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{getDayName(s.dayOfWeek)}</span>
                      <span className="text-gray-500">{s.startTime} – {s.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Servicios Disponibles</h2>
              {activeServices.length === 0 ? (
                <p className="text-sm text-gray-400">No hay servicios registrados</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeServices.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <span className="text-sm font-bold text-primary-600 whitespace-nowrap">
                          {formatPrice(Number(s.price))}
                        </span>
                      </div>
                      {s.description && (
                        <p className="mt-1 text-xs text-gray-500">{s.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Agendar Cita"
        size="xl"
      >
        <BookingWizard
          doctorId={doctor.id}
          services={activeServices}
          onSuccess={() => { setBookingOpen(false); navigate('/patient/appointments'); }}
          onCancel={() => setBookingOpen(false)}
        />
      </Modal>
    </PageLayout>
  );
}
