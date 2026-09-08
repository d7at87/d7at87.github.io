import { useSite } from '../cms/store'
import { WhatsAppIcon } from './CartDrawer'

export default function WhatsAppFloat() {
  const { data } = useSite()
  const wa = data.settings.whatsapp
  return (
    <a
      href={`https://wa.me/${wa}?text=${encodeURIComponent('مرحباً')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="whatsapp"
      className="fixed bottom-6 start-6 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition hover:scale-110"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
