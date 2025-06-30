import { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalProp{
    children: React.ReactNode;
    target?: string
}

const createWrapperAndAppendToBody = (wrapperId: string) => {
    const wrapperElement = document.createElement('div');
    wrapperElement.setAttribute("id", wrapperId);
    document.body.appendChild(wrapperElement);
    return wrapperElement;
}

const Portal = ({children, target='portal-root'}:PortalProp) => {
    const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);

    useLayoutEffect(() => {
        let element = document.getElementById(target);
        let systemCreated = false;

        if (!element) {
            systemCreated = true;
            element = createWrapperAndAppendToBody(target);
        }
        setWrapperElement(element);

        return () => {
            if (systemCreated && element?.parentNode) {
                element.parentNode.removeChild(element);
            }
        }
    }, [target]);

    if (wrapperElement === null) return null;
    return createPortal(children, wrapperElement);
}

export default Portal;