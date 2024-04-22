import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="fixed bottom-0 flex w-full justify-end">
      <Link href="https://github.com/segersniels/genmoji" target="_blank">
        <FaGithub className="mb-2 mr-2 text-2xl hover:text-gray-700" />
      </Link>
    </div>
  );
};

export default Footer;
