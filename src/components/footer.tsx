import Link from 'next/link';
import { FaGithub, FaNpm } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="flex fixed bottom-0 w-full justify-end">
      <Link
        href="https://www.npmjs.com/package/@segersniels/gitmoji"
        target="_blank"
      >
        <FaNpm className="text-2xl hover:text-gray-700 mb-2 mr-2" />
      </Link>

      <Link href="https://github.com/segersniels/genmoji" target="_blank">
        <FaGithub className="text-2xl hover:text-gray-700 mb-2 mr-2" />
      </Link>
    </div>
  );
};

export default Footer;
