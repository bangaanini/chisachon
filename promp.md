ini dtruktur proyek saya
public/
src/
    - components/
        AdminChat.tsx
        LiveChat.tsx
    - utils/
        Cloudmining.ts
        telegram.ts
    - pages/
        - admin/
            index.tsx
        - api/
            socketio.ts
        _app.tsx
        index.tsx
    wagmi.ts
.env

tolong sesuaikan kode dengan struktur proyek saya.
karna saat ini saat saya coba fitur live chat, ketika sudah menulis pesan dan menekan kirim,teks tersebut langsung hilang,
saya ingin sebelum memulai live chat user harus memasukan nama dan pesannya dulu,
baru kemudian mengirim livechat ke admin,
dan pesan akan tersimpan sementara di pop up obrolan live chat