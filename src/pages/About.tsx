
import Layout from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About Us</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We're dedicated to simplifying communication and enhancing productivity through our AI-powered assistant. Our goal is to help you manage your digital life more effectively, saving you time and reducing stress.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">What We Do</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Our platform integrates with your favorite messaging and email services, providing intelligent organization, prioritization, and response suggestions. We're constantly innovating to bring you the best experience possible.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Our Values</h2>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                <li className="mb-2"><span className="font-medium">Privacy First</span>: Your data security is our top priority.</li>
                <li className="mb-2"><span className="font-medium">Innovation</span>: We're always exploring new ways to improve.</li>
                <li className="mb-2"><span className="font-medium">Simplicity</span>: Technology should make life easier, not more complicated.</li>
                <li><span className="font-medium">Accessibility</span>: Our tools are designed for everyone.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Get In Touch</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Have questions or feedback? We'd love to hear from you! Contact our support team for assistance.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
