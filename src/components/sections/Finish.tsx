import React from "react";
import s from "./Finish.module.scss";

const Finish = () => {
  return (
    <section className={s.finish}>
      <div className={s.finish__container}>
        <p className={s.finish__intro}>
          Теперь вы знаете, какая физическая нагрузка будет полезна не только
          для <br />
          вашего тела, но и для вашего карьерного трека. Остался последний
          рывок! <br />
          Сделайте уверенный пас и положите начало новой привычке.
        </p>
        <div className={s.flex_bottom}>
          <div className={s.finish__grid}>
            <div className={s.finish__column}>
              <div className={s.finish__imageWrapper}>
                <img className={s.finish__image} src="/images/f-1.svg" alt="" />
              </div>
              <div className={s.finish__card}>
                <div className={s.finish__content}>
                  <div className={s.finish__text}>
                    <p className={s.finish__name}>Это Паша</p>
                    <p className={s.finish__description}>
                      Он пришёл прокачать скорость принятия решений и теперь
                      обходит защитников лучше всех. Ему можно кинуть короткий
                      пас!
                    </p>
                  </div>
                  <img
                    className={s.finish__image}
                    src="/images/f-2.svg"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className={s.finish__column}>
              <div className={s.finish__card}>
                <div className={s.finish__content}>
                  <div className={s.finish__text}>
                    <p className={s.finish__name}>Это Паша</p>
                    <p className={s.finish__description}>
                      Он пришёл прокачать скорость принятия решений и теперь
                      обходит защитников лучше всех. Ему можно кинуть короткий
                      пас!
                    </p>
                  </div>
                  <img
                    className={s.finish__image}
                    src="/images/f-4.svg"
                    alt=""
                  />
                </div>
              </div>
              <img className={s.finish__image} src="/images/f-3.svg" alt="" />
            </div>
          </div>
          <div className={s.finish__footer}>
            <div className={s.finish__legal}>
              <p>erid:</p>
              <p>Реклама 18+</p>
              <p>Рекламодатель ООО «СПРИНГЛ». ИНН 7714482000</p>
              <p>
                <a
                  className={s.finish__link}
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Политика конфиденциальности
                </a>
              </p>
            </div>
            <div className={s.finish__credits}>
              <p>
                Сделано в{" "}
                <a className={s.finish__link} href="">
                  Ander
                </a>{" "}
                x{" "}
                <a className={s.finish__link} href="">
                  Loimi
                </a>
              </p>
            </div>
          </div>
        </div>
        <img className={s.tarelka} src="/images/footer.svg" alt="" />
      </div>
    </section>
  );
};

export default Finish;
