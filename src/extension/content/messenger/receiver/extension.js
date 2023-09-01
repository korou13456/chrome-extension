import Messenger from '../index';
import main from 'extension/content/main';

Messenger.on('extension:cs:run', () => {
    main();
});
