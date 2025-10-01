
import React from 'react';

const Manifesto: React.FC = () => {
  return (
    <section id="manifesto" className="bg-white text-black py-20 md:py-32 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="font-montserrat text-4xl md:text-5xl font-black mb-6">
          The Spark.
        </h2>
        <div className="font-roboto text-lg md:text-xl text-gray-800 space-y-6 leading-relaxed">
          <p>
            I believe technology is more than just code and circuits. It's a language for creativity, a tool for connection, and a canvas for our wildest ideas. It's about building bridges, not just apps.
          </p>
          <p>
            My work is driven by a single, simple principle: <strong className="font-bold">leave things better than I found them.</strong> Whether it's a line of code, a piece of content, or a community, the goal is to add value, spark curiosity, and empower others to create.
          </p>
          <p>
            This is not just a portfolio. It's an open invitation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
