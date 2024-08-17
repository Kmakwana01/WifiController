import fs from 'fs';
import path from 'path';

const loadRootCAs = () => {
    try {
        const certsDir = path.join(__dirname, 'certs', 'apple_root_cas');
        const certFiles = fs.readdirSync(certsDir);

        const rootCAs = certFiles.map((certFile) => {
            const certPath = path.join(certsDir, certFile);
            return fs.readFileSync(certPath);
        });

        return rootCAs;
        
    } catch (error) {
        console.error('Error loading root CAs:', error);
        return [];
    }
};

export default loadRootCAs;