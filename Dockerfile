FROM ubuntu:16.04

ENV VERSION 1.0.5

RUN apt-get -qq update
RUN apt-get -qq install -y --no-install-recommends wget
RUN wget --no-check-certificate -O /tmp/multichain.tar.gz https://www.multichain.com/download/multichain-${VERSION}.tar.gz
RUN tar -xzf /tmp/multichain.tar.gz -C /usr/local/bin/ --strip-components=1
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN groupadd -r multichain -g 600 && \
    useradd --system --gid multichain --home-dir /home/multichain --create-home --uid 601 multichain

USER multichain
WORKDIR /home/multichain

COPY config/ /home/multichain/.multichain/

USER root
RUN chown -R multichain:multichain /home/multichain/.multichain/
USER multichain