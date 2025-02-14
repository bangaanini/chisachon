import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[url('/herobg.png')] bg-cover bg-center bg-no-repeat bg-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Text Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-left m-8 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-5xl font-extrabold text-transparent ...">
            CHISACHON CLOUD MINING
          </h1>
          <p className="text-lg text-left sm:text-xl text-white mb-8 max-w-xl m-8">
            Experience hassle-free crypto mining with our advanced cloud mining solutions. 
            Mine cryptocurrencies without hardware investment - secure, efficient, and profitable.
          </p>
        </div>
        {/* Image Container */}
        <div className="md:w-1/2 relative">
          
          <div className="relative overflow-hidden">
            <img
              src="/hero.png" // Ganti dengan path gambar Anda
              alt="Hero Image"
              className="w-full max-w-sm h-auto object-cover transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>      
      </div>
    </section>
  );
};


export default HeroSection;