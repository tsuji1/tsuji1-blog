import Image from "next/image";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

export default function Home() {
  const avatar_height = 200;
  const avatar_width = 200;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col md:flex-row items-center mb-6">
        <Image
          src="https://github.com/tsuji1.png"
          alt="tsuji1's GitHub profile picture"
          width={avatar_width}
          height={avatar_height}
          className="rounded-full"
        />
        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
          <h1 className="text-2xl font-bold">tsuji1</h1>
          <p className="text-lg">I'm student of University of Electro-Communications</p>
        </div>
      </div>
      
      <div className="flex space-x-4 mt-4">
        <a 
          href="https://github.com/tsuji1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-6xl hover:text-gray-600 transition-colors"
          aria-label="GitHub Profile"
        >
          <FaGithub />
        </a>
        <a 
          href="https://x.com/t2uj1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-6xl hover:text-gray-600 transition-colors"
          aria-label="X.com Profile"
        >
          <FaXTwitter />
        </a>
      </div>
    </div>
  );
}
