import Link from 'next/link';
import { FaGithub, FaNpm } from 'react-icons/fa';

import styles from './styles.module.css';

const Footer = () => {
  return (
    <div className={styles.container}>
      <Link
        href="https://www.npmjs.com/package/@segersniels/gitmoji"
        target="_blank"
      >
        <FaNpm className={styles.icon} />
      </Link>

      <Link href="https://github.com/segersniels/genmoji" target="_blank">
        <FaGithub className={styles.icon} />
      </Link>
    </div>
  );
};

export default Footer;
