import { useEffect, useState } from 'react';
import CIMBLogoWhite from '../../assets/img/CIMB_Niaga_logo_white.svg';
import CIMBLogo from '../../assets/img/CIMB_Niaga_logo.svg';

const useLogo = () => {
    const [logo, setLogo] = useState<string>(CIMBLogo);

    useEffect(() => {
        const updateLogo = () => {
            const theme = document.documentElement.getAttribute('data-theme') || 'red-light';
            setLogo(theme.endsWith('dark') ? CIMBLogoWhite : CIMBLogo);
        }
        updateLogo();

        const observer = new MutationObserver(updateLogo);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, []);

    return logo;
}

export default useLogo;