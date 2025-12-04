import styles from "./McZapBanner.module.css";

interface McZapBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  secondaryText: string;
  warningText: string;
  onClick: () => void;
}

export default function McZapBanner({
  title,
  subtitle,
  secondaryText,
  warningText,
  buttonText,
  onClick,
}: McZapBannerProps) {
  return (
    <div className={styles.bannerContainer}>
      {/* Título principal */}
      <h2 className={styles.mainTitle}>{title}</h2>

      {/* Subtítulo  */}
      <p className={styles.subtitle}>{subtitle}</p>

      {/* exto secundário */}
      <p className={styles.secondaryText}>{secondaryText}</p>

      {/* Texto de aviso */}
      <p className={styles.warningText}>{warningText}</p>

      {/*Botão de Ação */}
      <button className={styles.button} onClick={onClick}>
        {buttonText}
      </button>

      {/* Texto de redirecionamento */}
      <p className={styles.redirectionText}>
        Você será redirecionado para o WhatsApp
      </p>
    </div>
  );
}
