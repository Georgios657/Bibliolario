import { Book } from '@/app/components/BookTable';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Der Prozess',
    authors: ['Franz Kafka'],
    language: 'Deutsch',
    publishedDate: '1925',
    ratings: {
      stars: 4.5,
      quality: 9.2,
      fetish: 7.8,
      cover: 8.5,
    },
    reviews: [
      {
        id: 'r1',
        userName: 'Anna Schmidt',
        comment:
          'Ein Meisterwerk der Literatur! Kafkas düstere Vision von Bürokratie und Macht ist zeitlos. Die Atmosphäre ist bedrückend, aber genau das macht die Stärke dieses Romans aus.',
        date: '15.01.2026',
        ratings: {
          stars: 5,
          quality: 10,
          fetish: 8,
          cover: 9,
        },
      },
      {
        id: 'r2',
        userName: 'Michael Weber',
        comment:
          'Interessantes Buch, aber nicht für jeden. Die kafkaeske Atmosphäre ist gewöhnungsbedürftig. Trotzdem ein wichtiges Werk der Weltliteratur.',
        date: '10.01.2026',
        ratings: {
          stars: 4,
          quality: 8.5,
          fetish: 7.5,
          cover: 8,
        },
      },
    ],
  },
  {
    id: '2',
    title: 'Harry Potter und der Stein der Weisen',
    authors: ['J.K. Rowling'],
    language: 'Deutsch',
    publishedDate: '1997',
    ratings: {
      stars: 4.8,
      quality: 9.5,
      fetish: 8.9,
      cover: 9.3,
    },
    reviews: [
      {
        id: 'r3',
        userName: 'Sophie Müller',
        comment:
          'Ein absoluter Klassiker! Die Welt von Hogwarts ist einfach magisch. Perfekt für Jung und Alt. Habe es schon dreimal gelesen und entdecke immer wieder neue Details.',
        date: '20.01.2026',
        ratings: {
          stars: 5,
          quality: 10,
          fetish: 9.5,
          cover: 10,
        },
      },
      {
        id: 'r4',
        userName: 'Thomas Klein',
        comment:
          'Sehr unterhaltsam und fesselnd geschrieben. Die Charaktere sind liebevoll gestaltet und die Geschichte zieht einen sofort in ihren Bann.',
        date: '18.01.2026',
        ratings: {
          stars: 5,
          quality: 9.5,
          fetish: 8.5,
          cover: 9,
        },
      },
      {
        id: 'r5',
        userName: 'Laura Fischer',
        comment:
          'Ein Buch, das Generationen verbindet. Meine Kinder lieben es genauso wie ich damals. Die deutsche Übersetzung ist hervorragend gelungen.',
        date: '12.01.2026',
        ratings: {
          stars: 4.5,
          quality: 9,
          fetish: 8.5,
          cover: 9,
        },
      },
    ],
  },
  {
    id: '3',
    title: 'Sapiens: A Brief History of Humankind',
    authors: ['Yuval Noah Harari'],
    language: 'Englisch',
    publishedDate: '2011',
    ratings: {
      stars: 4.6,
      quality: 9.4,
      fetish: 8.2,
      cover: 7.8,
    },
    reviews: [
      {
        id: 'r6',
        userName: 'David Schneider',
        comment:
          'Mind-blowing! Harari schafft es, die Geschichte der Menschheit auf verständliche und faszinierende Weise zu erzählen. Ein absolutes Must-Read.',
        date: '25.01.2026',
        ratings: {
          stars: 5,
          quality: 10,
          fetish: 9,
          cover: 8,
        },
      },
      {
        id: 'r7',
        userName: 'Emma Becker',
        comment:
          'Sehr aufschlussreich und gut recherchiert. Einige Thesen sind kontrovers, aber genau das macht es interessant. Regt zum Nachdenken an.',
        date: '22.01.2026',
        ratings: {
          stars: 4.5,
          quality: 9.5,
          fetish: 7.5,
          cover: 7.5,
        },
      },
    ],
  },
  {
    id: '4',
    title: 'Die Verwandlung',
    authors: ['Franz Kafka'],
    language: 'Deutsch',
    publishedDate: '1915',
    ratings: {
      stars: 4.3,
      quality: 8.9,
      fetish: 7.5,
      cover: 8.2,
    },
    reviews: [
      {
        id: 'r8',
        userName: 'Julia Hoffmann',
        comment:
          'Kurz, aber intensiv. Kafkas Erzählung über Gregor Samsa ist verstörend und faszinierend zugleich. Eine Allegorie auf Entfremdung und Familie.',
        date: '08.01.2026',
        ratings: {
          stars: 4.5,
          quality: 9.5,
          fetish: 8,
          cover: 8.5,
        },
      },
      {
        id: 'r9',
        userName: 'Martin Schulz',
        comment:
          'Klassiker der deutschen Literatur. Nicht einfach zu lesen, aber lohnenswert. Die Symbolik ist vielschichtig.',
        date: '05.01.2026',
        ratings: {
          stars: 4,
          quality: 8.5,
          fetish: 7,
          cover: 8,
        },
      },
    ],
  },
  {
    id: '5',
    title: '1984',
    authors: ['George Orwell'],
    language: 'Englisch',
    publishedDate: '1949',
    ratings: {
      stars: 4.7,
      quality: 9.6,
      fetish: 8.7,
      cover: 8.9,
    },
    reviews: [
      {
        id: 'r10',
        userName: 'Sarah Wagner',
        comment:
          'Erschreckend aktuell! Orwells dystopische Vision ist heute relevanter denn je. Ein Buch, das jeder gelesen haben sollte.',
        date: '27.01.2026',
        ratings: {
          stars: 5,
          quality: 10,
          fetish: 9,
          cover: 9,
        },
      },
      {
        id: 'r11',
        userName: 'Alexander Meyer',
        comment:
          'Meisterwerk der dystopischen Literatur. Die Beschreibung der totalitären Überwachungsgesellschaft ist beklemmend real.',
        date: '24.01.2026',
        ratings: {
          stars: 5,
          quality: 10,
          fetish: 9,
          cover: 9.5,
        },
      },
      {
        id: 'r12',
        userName: 'Nina Richter',
        comment:
          'Schwere Kost, aber absolut lesenswert. Orwells Schreibstil ist brillant. Das Buch macht nachdenklich.',
        date: '21.01.2026',
        ratings: {
          stars: 4.5,
          quality: 9,
          fetish: 8,
          cover: 8.5,
        },
      },
    ],
  },
  {
    id: '6',
    title: 'Der kleine Prinz',
    authors: ['Antoine de Saint-Exupéry'],
    language: 'Deutsch',
    publishedDate: '1943',
    ratings: {
      stars: 4.9,
      quality: 9.8,
      fetish: 9.5,
      cover: 9.7,
    },
    reviews: [
      {
        id: 'r13',
        userName: 'Katharina Braun',
        comment:
          'Ein Buch für Herz und Seele! Die Geschichte des kleinen Prinzen berührt mich jedes Mal aufs Neue. Zeitlos schön.',
        date: '26.01.2026',
        ratings: {
          stars: 5,
          quality: 10,
          fetish: 10,
          cover: 10,
        },
      },
      {
        id: 'r14',
        userName: 'Patrick Zimmermann',
        comment:
          'Wunderschön illustriert und geschrieben. Eine philosophische Reise, die zum Nachdenken anregt. Für Kinder und Erwachsene gleichermaßen.',
        date: '23.01.2026',
        ratings: {
          stars: 5,
          quality: 10,
          fetish: 9.5,
          cover: 10,
        },
      },
      {
        id: 'r15',
        userName: 'Claudia Koch',
        comment:
          'Man entdeckt das Wesentliche. Die Botschaft ist einfach und doch so tiefgründig. Ein Lieblingsbuch für immer.',
        date: '19.01.2026',
        ratings: {
          stars: 4.8,
          quality: 9.5,
          fetish: 9,
          cover: 9.5,
        },
      },
    ],
  },
  {
    id: '7',
    title: 'Educated',
    authors: ['Tara Westover'],
    language: 'Englisch',
    publishedDate: '2018',
    ratings: {
      stars: 4.6,
      quality: 9.3,
      fetish: 8.5,
      cover: 8.4,
    },
    reviews: [
      {
        id: 'r16',
        userName: 'Lisa Hoffmann',
        comment:
          'Eine unglaubliche Geschichte! Tara Westovers Weg aus ihrer isolierten Kindheit zur Bildung ist inspirierend und bewegend.',
        date: '17.01.2026',
        ratings: {
          stars: 5,
          quality: 10,
          fetish: 9,
          cover: 8.5,
        },
      },
      {
        id: 'r17',
        userName: 'Jonas Krüger',
        comment:
          'Fesselnd von der ersten bis zur letzten Seite. Eine Geschichte über die Kraft der Bildung und Selbstbestimmung.',
        date: '14.01.2026',
        ratings: {
          stars: 4.5,
          quality: 9,
          fetish: 8,
          cover: 8,
        },
      },
    ],
  },
  {
    id: '8',
    title: 'Die Blechtrommel',
    authors: ['Günter Grass'],
    language: 'Deutsch',
    publishedDate: '1959',
    ratings: {
      stars: 4.2,
      quality: 8.8,
      fetish: 7.2,
      cover: 8.1,
    },
    reviews: [
      {
        id: 'r18',
        userName: 'Robert Lang',
        comment:
          'Ein wichtiges Werk der deutschen Nachkriegsliteratur. Grass\' Erzählstil ist einzigartig, wenn auch nicht immer einfach zugänglich.',
        date: '11.01.2026',
        ratings: {
          stars: 4,
          quality: 9,
          fetish: 7,
          cover: 8,
        },
      },
      {
        id: 'r19',
        userName: 'Petra Neumann',
        comment:
          'Provokant und tiefgründig. Oskar Matzerath ist ein unvergesslicher Protagonist. Das Buch erfordert Geduld, belohnt aber mit großer Literatur.',
        date: '07.01.2026',
        ratings: {
          stars: 4.5,
          quality: 8.5,
          fetish: 7.5,
          cover: 8.5,
        },
      },
    ],
  },
];