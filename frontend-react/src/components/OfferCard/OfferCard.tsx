import styles from "./OfferCard.module.css";

interface OfferCardProps {
  imageSrc: string;
  title: string;
  description: string;
  price?: string;
}

export default function OfferCard({
  imageSrc,
  title,
  description,
  price,
}: OfferCardProps) {
  const isBigMac = title.includes("Big Mac");
  const isMcFlurry = title.includes("McFlurry");

  let titleClass = "";
  if (isBigMac) {
    titleClass = styles.titleBigMac;
  } else if (isMcFlurry) {
    titleClass = styles.titleMcFlurry;
  }

  let imageTextClass = "";
  if (isBigMac) {
    imageTextClass = styles.textBigMac;
  } else if (isMcFlurry) {
    imageTextClass = styles.textMcFlurry;
  }

  const placeholderStyle = {
    backgroundColor: isBigMac ? "#FFC72D" : "#B20404",
  };

  return (
    <div className={styles.offerCard} role="presentation">
      <div className={styles.imagePlaceholder} style={placeholderStyle}>
        <span className={`${styles.imageText} ${imageTextClass}`}>
          {imageSrc}
        </span>
      </div>

      <div className={styles.offerDetails}>
        <h3 className={`${styles.offerTitle} ${titleClass}`}>{title}</h3>
        {price && <p className={styles.offerPrice}>{price}</p>}
        <p className={styles.offerDescription}>{description}</p>
      </div>
    </div>
  );
}
