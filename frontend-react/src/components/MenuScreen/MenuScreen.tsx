import styles from "./MenuScreen.module.css";
import McZapBanner from "../McZapBanner/McZapBanner";
import { useEffect, useState } from "react";
import OfferCard from "../OfferCard/OfferCard";
import { href } from "react-router-dom";

export default function MenuScreen() {
  // Estado para armazenar a localização
  const [userLocation, setUserLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });

  // Coleta geolocalização ao montar o componente
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Salva a latitude e longitude no estado
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log(
            "Localização coletada:",
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.error("Erro ao obter a localização:", error);
        }
      );
    } else {
      console.error("Geolocalização não é suportada pelo navegador.");
    }
  }, []);

  const handleWhatsappRedirect = () => {
    const whatsappUrl =
      "https://wa.me/5531996360018?text=Olá,%20quero%20fazer%20um%20pedido.";

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.mainContent}>
        {/* Banner McZap */}
        <McZapBanner
          title="MÉQUI NO ZAP"
          subtitle="Seu pedido pelo Whatsapp"
          secondaryText="Peça seu Méqui favorito de forma super fácil e rápida"
          warningText="Seu plano tem WhatsApp ilimitado? Peça agora seu Méqui, sem descontar seus dados!"
          buttonText="FAZER PEDIDO AGORA"
          onClick={() => handleWhatsappRedirect()}
        />

        {/* Conteúdo Principal - Lista de Ofertas*/}
        <h2 className={styles.offersTitle}>Aproveite as ofertas do dia!</h2>

        <div className={styles.offersSection}>
          <OfferCard
            imageSrc="Big Mac"
            title="Combo Big Mac"
            description="Por apenas R$ 29,90"
          />
          <OfferCard
            imageSrc="Mc Flury"
            title="Sobremesa McFlurry"
            description="Compre 1, Leve 2"
          />
        </div>
      </div>
    </div>
  );
}
