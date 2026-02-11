import { Leaf, Target, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Our Mission',
      description: 'To reduce environmental contamination through AI-powered waste classification and education'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Driven',
      description: 'Building a global community of environmentally conscious individuals'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge AI technology to solve real-world environmental challenges'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-accent-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Leaf className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">About SmartWaste</h1>
            <p className="text-xl text-primary-50 max-w-3xl mx-auto">
              We're on a mission to make waste segregation intelligent, accessible, 
              and rewarding for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                SmartWaste was born from a simple observation: despite growing environmental 
                awareness, waste segregation remains a challenge for millions of people worldwide. 
                Confusion about proper disposal methods leads to contamination, reduced recycling 
                efficiency, and environmental harm.
              </p>
              <p>
                We combined deep learning technology with environmental science to create an 
                intelligent assistant that makes waste classification instant and accurate. Our 
                AI model, trained on thousands of waste images, can identify waste categories 
                with over 92% accuracy.
              </p>
              <p>
                But we didn't stop at classification. We built a complete ecosystem that tracks 
                your environmental impact, provides educational guidance, and rewards sustainable 
                behavior through our Eco Score system.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Drives Us
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="text-primary-500 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Making a difference, one classification at a time
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Waste Items Classified' },
              { number: '5K+', label: 'Active Users' },
              { number: '92%', label: 'Classification Accuracy' },
              { number: '24/7', label: 'Service Availability' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <p className="text-4xl font-bold text-primary-500 mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-600">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Powered by Advanced AI
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our deep learning model is built with TensorFlow and trained on thousands 
              of waste images. The system uses convolutional neural networks to identify 
              patterns and classify waste with high accuracy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['TensorFlow', 'React', 'Node.js', 'MongoDB', 'FastAPI'].map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
