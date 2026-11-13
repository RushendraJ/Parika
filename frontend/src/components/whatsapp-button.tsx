const WA_URL = "https://wa.me/919897593622?text=Hi%20Parika%2C%20I%27d%20like%20to%20know%20more";

export function WhatsAppButton() {
  return (
    <a
      href={WA_URL}
      onClick={(e) => {
        e.preventDefault();
        const w = window.open(WA_URL, "_blank", "noopener,noreferrer");
        if (!w) {
          try {
            window.top!.location.href = WA_URL;
          } catch {
            window.location.href = WA_URL;
          }
        }
      }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110"
    >
      <svg viewBox="0 0 32 32" className="size-8 fill-[#fff]" aria-hidden="true">
        <path d="M16.004 3C9.38 3 4 8.38 4 15.004c0 2.117.553 4.183 1.604 6.005L4 29l8.2-1.574a11.95 11.95 0 0 0 3.804.62h.004C22.624 28.046 28 22.666 28 16.04 28 9.42 22.624 3 16.004 3Zm0 22.86h-.003a9.9 9.9 0 0 1-5.05-1.384l-.362-.215-4.866.935.95-4.744-.236-.375a9.86 9.86 0 0 1-1.513-5.074c0-5.47 4.452-9.92 9.928-9.92 5.47 0 9.92 4.45 9.92 9.958 0 5.47-4.45 10.82-9.768 10.82Zm5.44-7.42c-.298-.15-1.763-.87-2.036-.97-.273-.1-.472-.15-.67.15-.2.298-.77.97-.944 1.17-.174.198-.348.223-.646.074-.298-.15-1.258-.464-2.396-1.478-.886-.79-1.484-1.766-1.658-2.064-.174-.298-.019-.46.13-.608.135-.133.299-.348.448-.522.15-.174.199-.298.299-.497.099-.199.05-.373-.025-.522-.075-.15-.67-1.616-.918-2.213-.242-.58-.487-.502-.67-.511l-.571-.01a1.1 1.1 0 0 0-.796.373c-.273.298-1.044 1.02-1.044 2.488 0 1.467 1.069 2.885 1.218 3.084.149.199 2.103 3.212 5.096 4.504.712.307 1.268.49 1.701.628.715.227 1.366.195 1.88.118.574-.085 1.763-.72 2.012-1.417.248-.696.248-1.293.174-1.417-.075-.124-.273-.199-.572-.348Z" />
      </svg>
    </a>
  );
}
